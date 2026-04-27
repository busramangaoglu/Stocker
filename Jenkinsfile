pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_DIR  = '/Users/busramangaoglu/Desktop/stoker'
    }

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
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} build --no-cache
                """
            }
        }

        stage('Test') {
            steps {
                echo 'Backend testleri çalıştırılıyor...'
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} run --rm backend \
                        sh -c "npm test"
                """
            }
        }

        stage('Deploy') {
            steps {
                echo 'Container\'lar yeniden başlatılıyor...'
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} down --remove-orphans
                    docker compose -f ${COMPOSE_FILE} up -d
                """
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
            sh """
                cd ${PROJECT_DIR}
                docker compose -f ${COMPOSE_FILE} logs --tail=50 || true
            """
        }
    }
}
