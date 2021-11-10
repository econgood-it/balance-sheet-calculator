import argparse
import subprocess
import shutil
import logging

npm = 'npm'
run = 'run'
docker_compose = 'docker-compose'


def install_dependencies(production: bool,):
    cmd = [npm, 'install']
    if production:
        cmd.append('--production')
    subprocess.run(cmd, check=True)


def check_linting():
    subprocess.run([npm, run, 'lint'], check=True)


def shutdown_test_database():
    subprocess.run([docker_compose, 'down'], check=True)


def startup_test_database():
    subprocess.run([docker_compose, 'up', '-d'], check=True)


def run_tests():
    subprocess.run([npm, run, 'test:prod'], check=True)


def compile():
    subprocess.run([npm, run, 'build'], check=True)


def rsync(folder: str, server_domain: str):
    subprocess.run(['rsync', '-a', folder, f"{server_domain}:", '--delete'], check=True)


def restart_server(server_domain: str):
    subprocess.run(['ssh', server_domain, 'bash bin/node-svc.sh restart'], check=True)


def main(args):
    logging.info(f"Start build and deployment process for the environment {args.environment}")
    logging.info(f"Install dependencies")
    install_dependencies(production=False)
    logging.info(f"Check linting")
    check_linting()
    logging.info(f"Run tests")
    shutdown_test_database()
    startup_test_database()
    run_tests()
    shutdown_test_database()
    logging.info(f"Build and compile")
    compile()
    shutil.rmtree('node_modules')
    install_dependencies(production=True)
    server_domain = 'ecg00-bcalc@ecg00.hostsharing.net' if args.environment == 'prod' else 'ecg04-bcalc_test@ecg04.hostsharing.net'
    logging.info(f"Copy dist and node_modules folder to {server_domain}")
    rsync(folder='dist', server_domain=server_domain)
    rsync(folder='node_modules', server_domain=server_domain)
    logging.info(f"Restarting the server at {server_domain}")
    restart_server(server_domain=server_domain)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description='Deploy balance sheet calculator')
    parser.add_argument('environment',
                        choices=['test', 'prod'],
                        help='Deploy it either to the test or production environment')
    args = parser.parse_args()
    main(args)
