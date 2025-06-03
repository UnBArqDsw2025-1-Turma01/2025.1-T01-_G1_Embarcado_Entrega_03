#ifndef MESSAGE_DIRECTOR_H
#define MESSAGE_DIRECTOR_H

#include "MessageBuilder.h" 
#include "Singleton/Sensor.h" 

class MessageDirector {
private:
    MessageBuilder* builder_ = nullptr; 
public:
    void setBuilder(MessageBuilder* builder) { this->builder_ = builder; }
    std::unique_ptr<BaseMessage> constructMessage(const Sensor::SensorData& data) {
        if (!builder_) {
            if (Serial) { Serial.println("ERRO: Builder nao configurado no Director!"); }
            return nullptr; 
        }
        builder_->reset(); 
        builder_->buildTimestamp(); 
        builder_->buildSpecificProductParts(data); 
        return builder_->getProduct(); 
    }
};

#endif // MESSAGE_DIRECTOR_H
