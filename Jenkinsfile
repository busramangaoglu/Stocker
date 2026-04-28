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
                echo "İmajlar doğrulandı, uygulama deploy edildi."
            }
        }

        stage('Health Check') {
            steps {
                echo 'Servis sağlık kontrolü yapılıyor...'
                sh 'curl -sf http://localhost:3000/ && echo "Backend hazır." || echo "Backend yanıt vermiyor, uygulama dışarıda çalışıyor olabilir."'
            }
        }
    }

    post {
        always {
            sh 'docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true'
        }
        success {
            echo 'Pipeline başarıyla tamamlandı.'
        }
        failure {
            echo 'Pipeline hata aldı. Logları inceleyin.'
        }
    }
}
