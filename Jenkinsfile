pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Clone') {
            steps {
                echo 'Cloning GitHub repository...'
                checkout scm
            }
        }

        // Commented out because no package.json yet
        /*
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
        */
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
