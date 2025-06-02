package model;

import enums.Genero;

import enums.StatusNotificacao;
import notification.Notificacao;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.List;


public class PessoaCuidador extends Pessoa {
    private List<PessoaMonitorada> pessoasMonitoradas; // Associação

    public PessoaCuidador(String nome, Genero genero, String cpf, LocalDate dataDeNascimento, Contato contato, Endereco endereco) {
        super(nome, genero, cpf, dataDeNascimento, contato, endereco);
        this.pessoasMonitoradas = new ArrayList<>();
    }

    public void receberNotificacao(Notificacao n) {
        System.out.println("[PessoaCuidador] " + this.nome + " recebeu notificação: " + n.getBaseadaEmResultado().getResumo());
        // Lógica para processar a notificação (e.g., exibir na UI)
    }

    public void confirmarRecebimento(Notificacao n) {
        n.alterarEstado(StatusNotificacao.Enviado); // O estado já pode estar Enviado, isso confirma o 'ack'
        System.out.println("[PessoaCuidador] " + this.nome + " confirmou recebimento da notificação. Novo estado: " + n.getEstado());
    }

    public void adicionarPessoaMonitorada(PessoaMonitorada pessoa) {
        this.pessoasMonitoradas.add(pessoa);
        System.out.println("[PessoaCuidador] " + this.nome + " agora monitora " + pessoa.getNome());
    }

    public List<PessoaMonitorada> getPessoasMonitoradas() {
        return pessoasMonitoradas;
    }
}