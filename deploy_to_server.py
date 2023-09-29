import argparse
import subprocess
import shutil
import logging
import os

yarn = 'yarn'
run = 'run'
docker = 'docker'
compose = 'compose'


def check_for_uncommitted_files():
    subprocess.run(['git', 'diff', '--quiet', 'HEAD'], check=True)


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
    commands = [
        'cd balance-sheet-calculator',
        'git pull',
        f"{docker} {compose} down",
        f"{docker} {compose} build",
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
    server_domain = 'ecg@prod.econgood.org' if args.environment == 'prod' else 'ecg@dev.econgood.org'
    logging.info(f"Build and deploy docker image to {server_domain}")
    build_and_deploy_remotely(server_domain=server_domain)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description='Deploy balance sheet calculator')
    parser.add_argument('environment',
                        choices=['test', 'prod'],
                        help='Deploy it either to the test or production environment')
    args = parser.parse_args()
    main(args)
