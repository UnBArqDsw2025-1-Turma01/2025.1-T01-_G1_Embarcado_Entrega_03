#ifndef UPDATEMESSAGE_H
#define UPDATEMESSAGE_H

#include "BaseMessage.h"
#include "Singleton/Sensor.h"
#include <Arduino.h> 

// Produto Concreto: Mensagem de Atualização
class UpdateMessage : public BaseMessage {
public:
    Sensor::SensorData currentSensorData;

    UpdateMessage() : BaseMessage("ATUALIZACAO_MEDICOES") {}

protected:
    std::string getPayloadDetails() const override {
        char buffer[400]; 
        snprintf(buffer, sizeof(buffer),
            "║  ------------ [ DADOS ATUAIS ] ------------\r\n"
            "║    Acelerômetro (g)  [X, Y, Z]: %.3f, %.3f, %.3f\r\n"
            "║    Giroscópio (°/s)  [X, Y, Z]: %.2f, %.2f, %.2f\r\n"
            "║    Temperatura (°C)           : %.2f\r\n"
            "║  --------------------------------------------",
            currentSensorData.ax_g, currentSensorData.ay_g, currentSensorData.az_g,
            currentSensorData.gx_dps, currentSensorData.gy_dps, currentSensorData.gz_dps,
            currentSensorData.temp_c);
        return buffer;
    }
};

#endif // UPDATEMESSAGE_H