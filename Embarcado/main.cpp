#include <Arduino.h>
#include <memory> 

#include "Singleton/Sensor.h"       
#include "Facade/MessageFacade.h"

// --- Instância Global da Facade ---
MessageFacade messageFacade;

const int SDA_PIN = 8; 
const int SCL_PIN = 9; 

void setup() {
    Serial.begin(115200);
    while (!Serial) { delay(10); }
    Serial.println("\n\n************************************************************");
    Serial.println("* Sistema de Monitoramento de Quedas com MPU6050        *");
    Serial.println("************************************************************");

    Sensor* sensorInstance = Sensor::getInstance(SDA_PIN, SCL_PIN); 
    
    if (sensorInstance == nullptr || !sensorInstance->init()) {
        Serial.println("\r[ERRO FATAL] Falha na inicializacao do sensor MPU6050!");
        while (1) { 
            delay(200); 
        }
    }
    Serial.println("\r[INFO] Sensor MPU6050 inicializado com sucesso.");
    Serial.println("\r[INFO] Sistema pronto para monitoramento.\n");
}

void displayMessage(const std::unique_ptr<BaseMessage>& msg) {
    if (msg) {
        Serial.print(msg->getFormattedMessage().c_str()); 
    } else {
        Serial.println("\r[AVISO] Tentativa de exibir mensagem nula (nullptr).");
    }
}

void loop() {
    Sensor* sensor = Sensor::getInstance(); 
    
    if (!sensor || !sensor->isInitialized()) { 
        Serial.println("\r[ERRO] Sensor nao disponivel ou nao inicializado no loop.");
        delay(1000);
        return;
    }

    sensor->readSensorData();
    Sensor::SensorData data = sensor->getSensorData(); 

    bool quedaDetectada = false;
    float acelMagnitude = sqrt(data.ax_g * data.ax_g + data.ay_g * data.ay_g + data.az_g * data.az_g);
    
    const float LIMIAR_SUPERIOR_QUEDA = 3.8f;
    const float LIMIAR_INFERIOR_QUEDA = 0.3f; 

    if (acelMagnitude > LIMIAR_SUPERIOR_QUEDA || acelMagnitude < LIMIAR_INFERIOR_QUEDA) { 
        quedaDetectada = true;
    }

    if (quedaDetectada) {
        Serial.println("\n\r[EVENTO] Queda detectada! Construindo mensagem de ALERTA...");
        // Usando a Facade para criar a mensagem
        std::unique_ptr<BaseMessage> alertMsg = messageFacade.createAlertMessage(data);
        displayMessage(alertMsg);
        delay(2000); 
    }

    static unsigned long lastUpdateTime = 0;
    unsigned long currentTime = millis(); 

    if (currentTime - lastUpdateTime > 5000) { 
        Serial.println("\n\r[INFO] Construindo mensagem de ATUALIZACAO DE MEDICOES...");
        // Usando a Facade
        std::unique_ptr<BaseMessage> updateMsg = messageFacade.createUpdateMessage(data);
        displayMessage(updateMsg);
        lastUpdateTime = currentTime;
    }

    static unsigned long lastStatusTime = 0;
    if (currentTime - lastStatusTime > 15000) { 
        Serial.println("\n\r[INFO] Construindo mensagem de STATUS DO SISTEMA...");
        // Usando a Facade
        std::unique_ptr<BaseMessage> statusMsg = messageFacade.createStatusMessage(data);
        displayMessage(statusMsg);
        lastStatusTime = currentTime;
    }

    delay(250); 
}