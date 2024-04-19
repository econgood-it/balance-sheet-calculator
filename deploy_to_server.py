import argparse
import subprocess
import shutil
import logging
import os
import git
from dotenv import load_dotenv

yarn = 'yarn'
run = 'run'
docker = 'docker'
build = 'build'
compose = 'compose'


def has_unpushed_changes():
    try:
        repo = git.Repo('.')
        remote_branch = repo.active_branch.tracking_branch()

        if remote_branch:
            # Get the number of commits ahead of the remote tracking branch
            commits_ahead = repo.iter_commits(f'{remote_branch.name}..{repo.active_branch.name}')
            num_commits_ahead = sum(1 for _ in commits_ahead)

            if num_commits_ahead > 0:
                logging.info(f"There are {num_commits_ahead} committed but unpushed changes.")
                return True
            else:
                logging.info("Branch is up to date. No unpushed changes.")
                return False
        else:
            logging.info("The branch is not tracking a remote branch.")
            return False
    except git.exc.InvalidGitRepositoryError:
        logging.error("Error: Not a valid Git repository.")
        return False


def check_for_uncommitted_files():
    repo = git.Repo('.')
    if repo.is_dirty():
        raise Exception('Please commit your changes before a deployment')
    if has_unpushed_changes():
        raise Exception('Please push your changes before a deployment')


def install_dependencies(production: bool,):
    cmd = [yarn, 'install']
    if production:
        cmd.append('--production')
    subprocess.run(cmd, check=True)


def check_linting():
    subprocess.run([yarn, run, 'lint'], check=True)


def shutdown_test_database():
    subprocess.run([docker, compose, "-f", "docker-compose-db.yml", 'down'], check=True)


def startup_test_database():
    subprocess.run([docker, compose, "-f", "docker-compose-db.yml", 'up', '-d'], check=True)


def run_tests():
    subprocess.run([yarn, run, 'test:ci'], check=True)


def build_docker_image(image_name: str, latest_commit_hash: str):
    subprocess.run([docker, build, "-t", f"{image_name}:{latest_commit_hash}", "-t", f"{image_name}:latest", '.'],
                   check=True)


def login_command_to_docker_hub(token: str):
    return f"docker login -u econgood -p {token}"


def push_docker_image(hub_token: str, image_name):
    subprocess.run(login_command_to_docker_hub(hub_token), check=True, shell=True)
    subprocess.run([docker, 'push', image_name, '--all-tags'], check=True)


def deploy_to_server(hub_token: str, server_domain: str, path_to_app_dir: str):
    commands = [
        login_command_to_docker_hub(hub_token),
        f"cd {path_to_app_dir}",
        f"docker compose pull",
        f"{docker} {compose} down",
        f"{docker} {compose} up -d"
    ]
    full_command = " && ".join(commands)
    subprocess.run(['ssh', server_domain, full_command], check=True)


def rm_folder(folder: str):
    if os.path.exists(folder) and os.path.isdir(folder):
        shutil.rmtree(folder)


def main(args):
    logging.info(f"Start build and deployment process for the environment {args.environment}")
    check_for_uncommitted_files()
    if args.environment == 'dev':
        logging.info(f"Install dependencies")
        rm_folder('node_modules')
        install_dependencies(production=False)
        logging.info(f"Check linting")
        check_linting()
        logging.info(f"Run tests")
        shutdown_test_database()
        startup_test_database()
        run_tests()
        shutdown_test_database()

        repo = git.Repo('.')
        latest_commit_hash = repo.head.commit.hexsha
        image_name = 'econgood/balance-sheet-api'
        logging.info(f"Build docker image")
        build_docker_image(
            image_name=image_name,
            latest_commit_hash=latest_commit_hash
        )
        logging.info(f"Push docker image")
        push_docker_image(
            image_name=image_name,
            hub_token=args.docker_hub_token,
        )
    server_domain = 'root@services.econgood.org' if args.environment == 'prod' else 'root@dev.econgood.org'
    path_to_app_dir = '/var/docker/balance-sheet-api' if args.environment == 'prod' else '/var/docker/balance-sheet-calculator'
    logging.info(f"Deploy to server {server_domain} and path {path_to_app_dir}")
    deploy_to_server(hub_token=args.docker_hub_token, server_domain=server_domain, path_to_app_dir=path_to_app_dir)
    logging.info(f"Deployment successful")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    load_dotenv(".docker_hub")
    parser = argparse.ArgumentParser(description='Deploy balance sheet calculator')
    parser.add_argument('environment',
                        choices=['test', 'prod'],
                        help='Deploy it either to the test or production environment')
    parser.add_argument('-dt', '--docker-hub-token', dest='docker_hub_token',
                        default=os.environ.get('DOCKER_HUB_TOKEN'))
    args = parser.parse_args()
    main(args)
