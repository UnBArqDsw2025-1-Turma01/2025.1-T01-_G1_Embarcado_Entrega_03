package factory;

import enums.Prioridade;
import enums.TipoAlerta;
import model.Notificacao;
import model.PessoaCuidador;

public abstract class NotificacaoFactory {
    public abstract Notificacao criarNotificacao(TipoAlerta tipo, Prioridade prioridade, PessoaCuidador destinatario);
}