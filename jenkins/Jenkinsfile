pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    tools {
        nodejs 'NodeJS'  // Must be configured in Jenkins tools
    }

    stages {
        stage('Clone') {
            steps {
                echo 'Cloning GitHub repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing NPM packages...'
                sh 'npm install'
            }
        }

        stage('Run Build') {
            steps {
                echo 'Running build...'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ecommerce-devops-app .'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
