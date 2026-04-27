pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Kaynak kod alınıyor...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Docker imajları build ediliyor...'
                sh 'docker compose -f docker-compose.yml build --no-cache'
            }
        }

        stage('Test') {
            steps {
                echo 'Backend testleri çalıştırılıyor...'
                sh 'docker run --rm stocker-backend npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "Container'lar başlatılıyor..."
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Servis sağlık kontrolü yapılıyor...'
                retry(5) {
                    sleep(time: 5, unit: 'SECONDS')
                    sh 'curl -sf http://localhost:3000/ || exit 1'
                }
                echo 'Backend hazır.'
            }
        }
    }

    post {
        success {
            echo 'Pipeline başarıyla tamamlandı. Uygulama ayakta.'
        }
        failure {
            echo 'Pipeline hata aldı. Logları inceleyin.'
            sh 'docker compose -f docker-compose.yml logs --tail=50 || true'
        }
    }
}
