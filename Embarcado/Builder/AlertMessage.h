#ifndef ALERTMESSAGE_H
#define ALERTMESSAGE_H

#include "BaseMessage.h"
#include "Singleton/Sensor.h"
#include <Arduino.h>

// Produto Concreto: Mensagem de Alerta
class AlertMessage : public BaseMessage { 
public:
    Sensor::SensorData criticalSensorData;
    std::string reason;

    AlertMessage() : BaseMessage("ALERTA_QUEDA") {}

protected:
    std::string getPayloadDetails() const override {
        char buffer[500]; 
        snprintf(buffer, sizeof(buffer),
            "║  ================ [ ALERTA ] ================\r\n"
            "║  Motivo                  : %s\r\n"
            "║  --------------------------------------------\r\n"
            "║  Dados do Sensor no Momento do Alerta:\r\n"
            "║    Acelerômetro (g)  [X, Y, Z]: %.2f, %.2f, %.2f\r\n"
            "║    Giroscópio (°/s)  [X, Y, Z]: %.2f, %.2f, %.2f\r\n"
            "║    Temperatura (°C)           : %.2f\r\n"
            "║  ============================================",
            reason.c_str(),
            criticalSensorData.ax_g, criticalSensorData.ay_g, criticalSensorData.az_g,
            criticalSensorData.gx_dps, criticalSensorData.gy_dps, criticalSensorData.gz_dps,
            criticalSensorData.temp_c);
        return buffer;
    }
};

#endif // ALERTMESSAGE_H
