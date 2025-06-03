#include "Sensor.h"

// Definição da instância estática
Sensor* Sensor::instance = nullptr;

// Construtor privado
Sensor::Sensor(int sda, int scl) : initialized(false), sda_pin(sda), scl_pin(scl) {}

// Destrutor privado
Sensor::~Sensor() {}

// Método para obter a instância única
Sensor* Sensor::getInstance(int sda_pin, int scl_pin) {
    if (instance == nullptr) {
        instance = new Sensor(sda_pin, scl_pin);
    }
    return instance;
}

// Inicializa o sensor
bool Sensor::init() {
    if (initialized) {
        return true;
    }
    
    Wire.begin(sda_pin, scl_pin);
    Wire.setClock(400000); // 400kHz I2C
    
    mpu.initialize();
    
    if (mpu.testConnection()) {
        Serial.println("MPU6050 conectado com sucesso!");
        
        // Configurações básicas do sensor
        mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_2);  // ±2g
        mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_250);  // ±250°/s
        
        initialized = true;
        Serial.println("MPU6050 inicializado!");
        return true;
    } else {
        Serial.println("Falha na conexão com MPU6050!");
        return false;
    }
}

// Lê os dados do sensor
void Sensor::readSensorData() {
    if (!initialized) {
        Serial.println("Sensor não inicializado!");
        return;
    }
    
    // Lê dados brutos
    int16_t ax, ay, az, gx, gy, gz, temp;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    temp = mpu.getTemperature();
    
    // Converte para unidades físicas
    sensorData.ax_g = ax / 16384.0;    // Acelerômetro (±2g)
    sensorData.ay_g = ay / 16384.0;
    sensorData.az_g = az / 16384.0;
    
    sensorData.gx_dps = gx / 131.0;    // Giroscópio (±250°/s)
    sensorData.gy_dps = gy / 131.0;
    sensorData.gz_dps = gz / 131.0;
    
    sensorData.temp_c = temp / 340.0 + 36.53;  // Temperatura
}

// Retorna os dados do sensor
Sensor::SensorData Sensor::getSensorData() const {
    return sensorData;
}

// Getters para acessar os dados
float Sensor::getAccelX() const { return sensorData.ax_g; }
float Sensor::getAccelY() const { return sensorData.ay_g; }
float Sensor::getAccelZ() const { return sensorData.az_g; }
float Sensor::getGyroX() const { return sensorData.gx_dps; }
float Sensor::getGyroY() const { return sensorData.gy_dps; }
float Sensor::getGyroZ() const { return sensorData.gz_dps; }
float Sensor::getTemperature() const { return sensorData.temp_c; }
bool Sensor::isInitialized() const { return initialized; }