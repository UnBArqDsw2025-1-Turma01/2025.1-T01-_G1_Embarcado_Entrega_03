#ifndef MESSAGE_FACADE_H
#define MESSAGE_FACADE_H

#include <memory> // Para std::unique_ptr
#include "Builder/MessageDirector.h"
#include "Builder/MessageBuilder.h"
#include "Builder/BaseMessage.h"
#include "Singleton/Sensor.h"

class MessageFacade {
private:
    // A Facade possui as instâncias do Director e dos Builders
    MessageDirector director_;
    AlertMessageBuilder alertBuilder_;
    UpdateMessageBuilder updateBuilder_;
    StatusMessageBuilder statusBuilder_;

public:
    MessageFacade() {
    }

    // Método para criar uma mensagem de alerta
    std::unique_ptr<BaseMessage> createAlertMessage(const Sensor::SensorData& data) {
        director_.setBuilder(&alertBuilder_);
        return director_.constructMessage(data);
    }

    // Método para criar uma mensagem de atualização
    std::unique_ptr<BaseMessage> createUpdateMessage(const Sensor::SensorData& data) {
        director_.setBuilder(&updateBuilder_);
        return director_.constructMessage(data);
    }

    // Método para criar uma mensagem de status
    std::unique_ptr<BaseMessage> createStatusMessage(const Sensor::SensorData& data) {
        director_.setBuilder(&statusBuilder_);
        return director_.constructMessage(data);
    }
};

#endif // MESSAGE_FACADE_H
