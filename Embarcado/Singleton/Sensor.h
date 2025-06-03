#ifndef SENSOR_H
#define SENSOR_H

#include <Wire.h>
#include <MPU6050.h>

class Sensor {
public:
    // Estrutura para armazenar os dados do sensor
    struct SensorData {
        float ax_g, ay_g, az_g;         // Aceleração em G
        float gx_dps, gy_dps, gz_dps;   // Velocidade angular em graus/s
        float temp_c;                   // Temperatura em Celsius
    };

private:
    static Sensor* instance;
    MPU6050 mpu;
    bool initialized;
    int sda_pin, scl_pin;
    
    SensorData sensorData;
    
    // Construtor privado para Singleton
    Sensor(int sda, int scl);
    
    // Destrutor privado
    ~Sensor();
    
    // Previne cópia
    Sensor(const Sensor&) = delete;
    Sensor& operator=(const Sensor&) = delete;

public:
    // Método para obter a instância única
    static Sensor* getInstance(int sda_pin = 21, int scl_pin = 22);
    
    // Inicializa o sensor
    bool init();
    
    // Lê os dados do sensor
    void readSensorData();
    
    // Retorna os dados do sensor
    SensorData getSensorData() const;
    
    // Getters para acessar os dados
    float getAccelX() const;
    float getAccelY() const;
    float getAccelZ() const;
    float getGyroX() const;
    float getGyroY() const;
    float getGyroZ() const;
    float getTemperature() const;
    bool isInitialized() const;
};

#endif // SENSOR_H