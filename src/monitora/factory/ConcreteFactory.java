package factory;

import enums.Prioridade;
import enums.TipoAlerta;
import model.Notificacao;
import model.PessoaCuidador;
import strategy.Email;
import strategy.IEnvio;
import strategy.Push;
import strategy.SMS;

public class ConcreteFactory extends NotificacaoFactory {

    @Override
    public Notificacao criarNotificacao(TipoAlerta tipo, Prioridade prioridade, PessoaCuidador destinatario) {
        IEnvio estrategia;

        switch (prioridade) {
            case ALTA:
                estrategia = new SMS();
                break;
            case MEDIA:
                estrategia = new Email();
                break;
            case BAIXA:
                estrategia = new Push();
                break;
            default:
                throw new IllegalArgumentException("Prioridade inválida");
        }

        return new Notificacao(tipo, prioridade, estrategia, destinatario);
    }
}
