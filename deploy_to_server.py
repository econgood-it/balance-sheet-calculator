import argparse
import subprocess
import shutil
import logging
import os
import git
from dotenv import dotenv_values

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


def build_and_deploy_remotely(server_domain: str):
    permission_env_file = "--env-file .env-docker/.env-user-permissions"
    commands = [
        'cd balance-sheet-calculator',
        'git pull',
        f"{docker} {compose} {permission_env_file} down",
        f"{docker} {compose} {permission_env_file} build",
        f"{docker} {compose} {permission_env_file} up -d"
    ]
    full_command = " && ".join(commands)
    subprocess.run(['ssh', server_domain, full_command], check=True)


def build_docker_image(latest_commit_hash: str):
    subprocess.run([docker, build, "-t", f"econgood/balance-sheet-api:{latest_commit_hash}", '.'], check=True)


def push_docker_image(latest_commit_hash: str):
    token = dotenv_values(".docker_hub")["TOKEN"]
    subprocess.run([docker, 'login', '-u', 'econgood', '-p', token], check=True)
    subprocess.run([docker, 'tag', f"econgood/balance-sheet-api:{latest_commit_hash}", 'econgood/balance-sheet-api:latest'], check=True)
    # Push the image with the latest commit message
    subprocess.run([docker, 'push', f"econgood/balance-sheet-api:{latest_commit_hash}"], check=True)
    # Push the image with the 'latest' tag
    subprocess.run([docker, 'push', 'econgood/balance-sheet-api:latest'], check=True)


def deploy_to_server(server_domain: str):
    permission_env_file = "--env-file .env-docker/.env-user-permissions"
    commands = [
        'cd balance-sheet-calculator',
        'git pull',
        f"{docker} {compose} {permission_env_file} down",
        f"{docker} {compose} {permission_env_file} up -d"
    ]
    full_command = " && ".join(commands)
    subprocess.run(['ssh', server_domain, full_command], check=True)

def rm_folder(folder: str):
    if os.path.exists(folder) and os.path.isdir(folder):
        shutil.rmtree(folder)

def main(args):
    # logging.info(f"Start build and deployment process for the environment {args.environment}")
    # check_for_uncommitted_files()
    # logging.info(f"Install dependencies")
    # rm_folder('node_modules')
    # install_dependencies(production=False)
    # logging.info(f"Check linting")
    # check_linting()
    # logging.info(f"Run tests")
    # shutdown_test_database()
    # startup_test_database()
    # run_tests()
    # shutdown_test_database()
    server_domain = 'ecg@prod.econgood.org' if args.environment == 'prod' else 'ecg@dev.econgood.org'
    # logging.info(f"Build and deploy docker image to {server_domain}")
    # build_and_deploy_remotely(server_domain=server_domain)
    repo = git.Repo('.')
    latest_commit_hash = repo.head.commit.hexsha
    logging.info(f"Build docker image")
    # build_docker_image(
    #     latest_commit_hash=latest_commit_hash
    # )
    logging.info(f"Push docker image")
    # push_docker_image(
    #     latest_commit_hash=latest_commit_hash
    # )
    logging.info(f"Deploy to server")
    deploy_to_server(server_domain=server_domain)
    logging.info(f"Deployment successful")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description='Deploy balance sheet calculator')
    parser.add_argument('environment',
                        choices=['test', 'prod'],
                        help='Deploy it either to the test or production environment')
    args = parser.parse_args()
    main(args)
