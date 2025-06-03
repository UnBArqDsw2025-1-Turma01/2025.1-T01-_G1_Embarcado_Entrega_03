package model;

import enums.Prioridade;
import enums.TipoAlerta;
import strategy.IEnvio;

public class Notificacao {
    private TipoAlerta tipo;
    private Prioridade prioridade;
    private IEnvio estrategia;
    private PessoaCuidador destinatario;

    public Notificacao(TipoAlerta tipo, Prioridade prioridade, IEnvio estrategia, PessoaCuidador destinatario) {
        this.tipo = tipo;
        this.prioridade = prioridade;
        this.estrategia = estrategia;
        this.destinatario = destinatario;
    }

    public void enviar() {
        estrategia.enviar(this);
    }

    public PessoaCuidador getDestinatario() {
        return destinatario;
    }
}