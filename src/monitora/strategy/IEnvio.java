package strategy;

import model.Notificacao;

public interface IEnvio {
    void enviar(Notificacao notificacao);
}