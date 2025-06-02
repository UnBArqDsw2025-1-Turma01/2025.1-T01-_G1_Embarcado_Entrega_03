package notification;

import enums.Prioridade;
import enums.StatusNotificacao;
import enums.TipoAlerta;
import model.PessoaCuidador;
import model.ResultadoAnalise;



public class Notificacao {
    private Prioridade prioridade;
    private StatusNotificacao estado;
    private TipoAlerta tipoAlerta;
    private IEnvio estrategia; // Delega envio (dependência)
    private PessoaCuidador destinatario; // Associação
    private ResultadoAnalise baseadaEmResultado; // Baseada em

    public Notificacao(Prioridade prioridade, TipoAlerta tipoAlerta, PessoaCuidador destinatario, ResultadoAnalise resultado) {
        this.prioridade = prioridade;
        this.tipoAlerta = tipoAlerta;
        this.estado = StatusNotificacao.Pendente;
        this.destinatario = destinatario;
        this.baseadaEmResultado = resultado;
        setEstrategia(tipoAlerta);
        System.out.println("[Notificacao] Notificação criada (Tipo: " + tipoAlerta + ", Prioridade: " + prioridade + ").");
    }

    private void setEstrategia(TipoAlerta tipoAlerta) {
        switch (tipoAlerta) {
            case SMS:
                this.estrategia = new EstrategiaSMS();
                break;
            case Email:
                this.estrategia = new EstrategiaEmail();
                break;
            case Push:
                this.estrategia = new EstrategiaPush();
                break;
            default:
                throw new IllegalArgumentException("Tipo de alerta desconhecido: " + tipoAlerta);
        }
    }

    public void enviar() {
        if (estrategia != null) {
            estrategia.enviar(this);
            this.estado = StatusNotificacao.Enviado; // Marca como enviado após tentar
            System.out.println("[Notificacao] Notificação enviada para " + destinatario.getNome() + ". Estado: " + this.estado);
        } else {
            System.err.println("[Notificacao] Erro: Nenhuma estratégia de envio definida para esta notificação.");
        }
    }

    public void alterarEstado(StatusNotificacao novo) {
        this.estado = novo;
        System.out.println("[Notificacao] Estado da notificação alterado para: " + novo);
    }

    public Prioridade getPrioridade() { return prioridade; }
    public StatusNotificacao getEstado() { return estado; }
    public TipoAlerta getTipoAlerta() { return tipoAlerta; }
    public PessoaCuidador getDestinatario() { return destinatario; }
    public ResultadoAnalise getBaseadaEmResultado() { return baseadaEmResultado; }
}

interface IEnvio {
    void enviar(Notificacao n);
}

class EstrategiaSMS implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaSMS] Enviando SMS para " + n.getDestinatario().getContato().getTelefone() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}

class EstrategiaEmail implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaEmail] Enviando E-mail para " + n.getDestinatario().getContato().getEmail() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}

class EstrategiaPush implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaPush] Enviando Notificação Push para " + n.getDestinatario().getNome() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}