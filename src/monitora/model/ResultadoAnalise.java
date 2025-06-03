package model;

import enums.Situacao;

public class ResultadoAnalise {
    private double riscoQueda;
    private boolean deveNotificar;
    private Situacao situacao;

    public ResultadoAnalise(double riscoQueda, boolean deveNotificar, Situacao situacao) {
        this.riscoQueda = riscoQueda;
        this.deveNotificar = deveNotificar;
        this.situacao = situacao;
        System.out.println("[ResultadoAnalise] Resultado da análise gerado: " + getResumo());
    }

    public String getResumo() {
        return "Risco de queda: " + (riscoQueda * 100) + "%, Situação: " + situacao.name() + ", Notificar: " + deveNotificar;
    }

    public boolean isCritico() {
        return deveNotificar && riscoQueda > 0.5; // Considera crítico se deve notificar e o risco é alto
    }

    public double getRiscoQueda() { return riscoQueda; }
    public boolean getDeveNotificar() { return deveNotificar; }
    public Situacao getSituacao() { return situacao; }
}