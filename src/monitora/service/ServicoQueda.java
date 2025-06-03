package service;

import enums.Situacao;
import model.ResultadoAnalise;

public class ServicoQueda {
    private SensorValidator sensorValidator; // Usa (dependência)

    public ServicoQueda() {
        this.sensorValidator = new SensorValidator();
        System.out.println("[ServicoQueda] ServicoQueda inicializado.");
    }

    public ResultadoAnalise analisar(Monitoramento m) {
        System.out.println("[ServicoQueda] Analisando dados do monitoramento...");
        double riscoQueda = 0.0;
        Situacao situacao = Situacao.EmAnalise;
        boolean deveNotificar = false;

        if (!sensorValidator.estaCalibrado(m.getSensor())) {
            situacao = Situacao.RequerNovaMedicao;
            System.out.println("[ServicoQueda] Sensor não calibrado. Requer nova medição.");
            return new ResultadoAnalise(0.0, false, situacao);
        }

        // Simulação de lógica de análise de queda
        if (m.getDeltaVariacaoGraus() > 45 && m.getTempoParadoSegundos() > 10) {
            riscoQueda = 0.9;
            situacao = Situacao.QuedaDetectada;
            deveNotificar = true;
        } else if (m.getDeltaVariacaoGraus() > 30 && m.getTempoParadoSegundos() > 5) {
            riscoQueda = 0.6;
            situacao = Situacao.EmAnalise;
            deveNotificar = true;
        } else {
            riscoQueda = 0.1;
            situacao = Situacao.TudoBem;
            deveNotificar = false;
        }

        System.out.println("[ServicoQueda] Análise concluída: Risco=" + (riscoQueda * 100) + "%, Situação=" + situacao + ", Notificar=" + deveNotificar + ".");
        return new ResultadoAnalise(riscoQueda, deveNotificar, situacao);
    }

    public boolean avaliarDadosCriticos(Monitoramento m) {
        // Implementação da lógica para determinar se os dados são críticos
        System.out.println("[ServicoQueda] Avaliando se os dados são críticos...");
        return m.getDeltaVariacaoGraus() > 45 && m.getTempoParadoSegundos() > 10;
    }
}