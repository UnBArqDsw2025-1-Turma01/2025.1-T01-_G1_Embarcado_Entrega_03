package service;

import enums.Situacao;


import java.time.LocalDateTime;

import model.PessoaMonitorada;
import model.PessoaCuidador;
import model.PessoaMonitorada;
import model.ResultadoAnalise;
import model.Sensor;




public class Monitoramento {
    private Situacao situacao;
    private int deltaVariacaoGraus;
    private int tempoParadoSegundos;
    private LocalDateTime dataHora;
    private Sensor sensor;
    private ResultadoAnalise resultado;
    private PessoaCuidador cuidadorAssociado;
    private PessoaMonitorada pessoaMonitoradaAssociada;

    public Monitoramento(int deltaVariacaoGraus, int tempoParadoSegundos, Sensor sensor, PessoaCuidador cuidadorAssociado, PessoaMonitorada pessoaMonitoradaAssociada) {
        this.deltaVariacaoGraus = deltaVariacaoGraus;
        this.tempoParadoSegundos = tempoParadoSegundos;
        this.dataHora = LocalDateTime.now();
        this.sensor = sensor;
        this.cuidadorAssociado = cuidadorAssociado;
        this.pessoaMonitoradaAssociada = pessoaMonitoradaAssociada;
        this.situacao = Situacao.EmAnalise;
        System.out.println("[Monitoramento] Novo monitoramento criado para " + pessoaMonitoradaAssociada.getNome() + " com sensor " + sensor.getTipo() + ".");
    }

    public String getResumo() {
        return "Monitoramento em " + dataHora + " com sensor " + sensor.getTipo() + ". Situação: " + situacao;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public ResultadoAnalise getResultado() {
        return resultado;
    }

    public void setResultado(ResultadoAnalise resultado) {
        this.resultado = resultado;
        this.situacao = resultado.getSituacao();
        System.out.println("[Monitoramento] Resultado da análise aplicado ao monitoramento. Nova situação: " + this.situacao);
    }

    public Situacao getSituacao() { return situacao; }
    public int getDeltaVariacaoGraus() { return deltaVariacaoGraus; }
    public int getTempoParadoSegundos() { return tempoParadoSegundos; }
    public LocalDateTime getDataHora() { return dataHora; }
    public PessoaCuidador getCuidadorAssociado() { return cuidadorAssociado; }
    public PessoaMonitorada getPessoaMonitoradaAssociada() { return pessoaMonitoradaAssociada; }
}