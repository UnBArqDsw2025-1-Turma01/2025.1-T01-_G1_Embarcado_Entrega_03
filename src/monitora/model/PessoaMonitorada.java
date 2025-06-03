package model;

import enums.Genero;

import enums.Situacao;

import model.Pessoa;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.List;



import service.Monitoramento;


public class PessoaMonitorada extends Pessoa {
    private List<Monitoramento> historicoMonitoramentos; // Associação
    private List<Sensor> sensoresAssociados; // Associação
    private List<PessoaCuidador> cuidadores; // Associação inversa

    public PessoaMonitorada(String nome, Genero genero, String cpf, LocalDate dataDeNascimento, Contato contato, Endereco endereco) {
        super(nome, genero, cpf, dataDeNascimento, contato, endereco);
        this.historicoMonitoramentos = new ArrayList<>();
        this.sensoresAssociados = new ArrayList<>();
        this.cuidadores = new ArrayList<>();
    }

    public void adicionarMonitoramento(Monitoramento m) {
        this.historicoMonitoramentos.add(m);
        System.out.println("[PessoaMonitorada] " + this.nome + " adicionou um novo registro de monitoramento.");
    }

    public List<Monitoramento> getHistorico() {
        return historicoMonitoramentos;
    }

    public Situacao getSituacaoAtual() {
        if (!historicoMonitoramentos.isEmpty()) {
            return historicoMonitoramentos.get(historicoMonitoramentos.size() - 1).getSituacao();
        }
        return Situacao.TudoBem; // Ou outra situação padrão se não houver monitoramentos
    }

    public void adicionarSensor(Sensor sensor) {
        this.sensoresAssociados.add(sensor);
        System.out.println("[PessoaMonitorada] " + this.nome + " associou o sensor " + sensor.getTipo() + " (" + sensor.getId() + ").");
    }

    public List<Sensor> getSensoresAssociados() {
        return sensoresAssociados;
    }

    public void adicionarCuidador(PessoaCuidador cuidador) {
        this.cuidadores.add(cuidador);
        System.out.println("[PessoaMonitorada] " + this.nome + " agora é monitorada por " + cuidador.getNome() + ".");
    }

    public List<PessoaCuidador> getCuidadores() {
        return cuidadores;
    }
}