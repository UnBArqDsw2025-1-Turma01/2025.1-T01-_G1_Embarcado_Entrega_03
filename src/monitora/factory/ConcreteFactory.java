package factory;

import enums.Prioridade;
import enums.TipoAlerta;
import model.Notificacao;
import model.PessoaCuidador;
import strategy.Email;
import strategy.IEnvio;
import strategy.Push;
import strategy.SMS;
import java.util.ArrayList;
import java.util.List;

public interface IEnvio {
    void enviar(Notificacao notificacao);
}

public class EnvioEmail implements IEnvio {
    @Override
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando Email para: " + notificacao.getDestinatario().getNome());
    }
}

public class EnvioSMS implements IEnvio {
    @Override
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando SMS para: " + notificacao.getDestinatario().getNome());
    }
}

public class EnvioPush implements IEnvio {
    @Override
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando Push para: " + notificacao.getDestinatario().getNome());
    }
}



public class EnvioComposite implements IEnvio {
    private List<IEnvio> canais = new ArrayList<>();

    public void adicionarCanal(IEnvio canal) {
        canais.add(canal);
    }

    @Override
    public void enviar(Notificacao notificacao) {
        for (IEnvio canal : canais) {
            canal.enviar(notificacao);
        }
    }
}


public class ConcreteFactory extends NotificacaoFactory {

    @Override
    public Notificacao criarNotificacao(TipoAlerta tipo, Prioridade prioridade, PessoaCuidador destinatario) {
        EnvioComposite estrategia = new EnvioComposite();

        switch (prioridade) {
            case ALTA:
                estrategia.adicionarCanal(new EnvioSMS());
                estrategia.adicionarCanal(new EnvioEmail());
                estrategia.adicionarCanal(new EnvioPush());
                break;
            case MEDIA:
                estrategia.adicionarCanal(new EnvioEmail());
                estrategia.adicionarCanal(new EnvioPush());
                break;
            case BAIXA:
                estrategia.adicionarCanal(new EnvioPush());
                break;
            default:
                throw new IllegalArgumentException("Prioridade inválida");
        }

        return new Notificacao(tipo, prioridade, estrategia, destinatario);
    }
}
