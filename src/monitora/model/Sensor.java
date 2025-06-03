package model;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

public class Sensor {
    private String id;
    private String tipo;
    private String localizacao;
    private LocalDate dataCalibracao;

    public Sensor(String tipo, String localizacao, LocalDate dataCalibracao) {
        this.id = UUID.randomUUID().toString(); // Gerar um ID único
        this.tipo = tipo;
        this.localizacao = localizacao;
        this.dataCalibracao = dataCalibracao;
        System.out.println("[Sensor] Sensor criado: " + getDescricao() + " (Calibração: " + dataCalibracao + ").");
    }

    public boolean estaCalibrado() {
        // Exemplo: sensor calibrado se a calibração foi nos últimos 6 meses (até 01/12/2024, dado o tempo atual de 01/06/2025)
        boolean calibrated = Period.between(dataCalibracao, LocalDate.now()).getMonths() <= 6;
        if (!calibrated) {
            System.out.println("[Sensor] Sensor " + id + " NÃO está calibrado. Última calibração: " + dataCalibracao);
        } else {
             System.out.println("[Sensor] Sensor " + id + " está calibrado.");
        }
        return calibrated;
    }

    public String getDescricao() {
        return "Sensor ID: " + id + ", Tipo: " + tipo + ", Localização: " + localizacao;
    }

    public String getId() { return id; }
    public String getTipo() { return tipo; }
    public String getLocalizacao() { return localizacao; }
    public LocalDate getDataCalibracao() { return dataCalibracao; }
}