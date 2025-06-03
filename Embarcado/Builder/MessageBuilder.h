#ifndef MESSAGE_BUILDER_H
#define MESSAGE_BUILDER_H

#include <memory> 

#include "BaseMessage.h"
#include "AlertMessage.h"    
#include "UpdateMessage.h"   
#include "StatusMessage.h"   
#include "Singleton/Sensor.h" 

class MessageBuilder {
public:
    virtual ~MessageBuilder() = default;
    virtual void reset() = 0; 
    virtual void buildTimestamp() = 0; 
    virtual void buildSpecificProductParts(const Sensor::SensorData& data) = 0;
    virtual std::unique_ptr<BaseMessage> getProduct() = 0;
};

class AlertMessageBuilder : public MessageBuilder { 
private:
    std::unique_ptr<AlertMessage> product; 
public:
    void reset() override { product = std::unique_ptr<AlertMessage>(new AlertMessage()); }
    void buildTimestamp() override { }
    void buildSpecificProductParts(const Sensor::SensorData& data) override {
        if (!product) reset(); 
        product->criticalSensorData = data;
        product->reason = "Valores de aceleracao anomalos"; // Razão mais específica
    }
    std::unique_ptr<BaseMessage> getProduct() override { return std::move(product); }
};

class UpdateMessageBuilder : public MessageBuilder { 
private:
    std::unique_ptr<UpdateMessage> product; 
public:
    void reset() override { product = std::unique_ptr<UpdateMessage>(new UpdateMessage()); }
    void buildTimestamp() override { }
    void buildSpecificProductParts(const Sensor::SensorData& data) override {
        if (!product) reset();
        product->currentSensorData = data;
    }
    std::unique_ptr<BaseMessage> getProduct() override { return std::move(product); }
};

class StatusMessageBuilder : public MessageBuilder { 
private:
    std::unique_ptr<StatusMessage> product; 
public:
    void reset() override { product = std::unique_ptr<StatusMessage>(new StatusMessage()); }
    void buildTimestamp() override { }
    void buildSpecificProductParts(const Sensor::SensorData& data) override {
        if (!product) reset();
        product->statusInfo = "Sensor MPU6050 operacional"; // Info mais específica
        product->currentTemp = data.temp_c; 
    }
    std::unique_ptr<BaseMessage> getProduct() override { return std::move(product); }
};

#endif // MESSAGE_BUILDER_H
