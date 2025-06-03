#ifndef STATUSMESSAGE_H
#define STATUSMESSAGE_H

#include "BaseMessage.h"
#include "Singleton/Sensor.h"
#include <Arduino.h>

// Produto Concreto: Mensagem de Status
class StatusMessage : public BaseMessage {
public:
    std::string statusInfo;
    float currentTemp;

    StatusMessage() : BaseMessage("STATUS_SISTEMA") {}

protected:
    std::string getPayloadDetails() const override {
        char buffer[256];
        snprintf(buffer, sizeof(buffer),
            "║  -------------- [ STATUS ] --------------\r\n"
            "║  Informação     : %s\r\n"
            "║  Temp. Atual    : %.2f °C\r\n"
            "║  --------------------------------------------",
            statusInfo.c_str(), currentTemp);
        return buffer;
    }

};

#endif // STATUSMESSAGE_H