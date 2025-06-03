package service;

import model.Sensor;

public class SensorValidator {
    public SensorValidator() {
        System.out.println("[SensorValidator] SensorValidator inicializado.");
    }

    public boolean verificar(String sensorId) {
        System.out.println("[SensorValidator] Verificando sensor ID: " + sensorId);
        // Simulação de verificação de existência do sensor
        return sensorId != null && !sensorId.isEmpty();
    }

    public boolean estaCalibrado(Sensor sensor) {
        System.out.println("[SensorValidator] Verificando calibração do sensor " + sensor.getId() + "...");
        // Delega para o próprio sensor verificar sua calibração
        return sensor.estaCalibrado();
    }
}