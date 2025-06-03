package strategy;

import model.Notificacao;

public class Email implements IEnvio {
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando email para " + notificacao.getDestinatario().getContato());
    }
}

package strategy;

import model.Notificacao;

public class SMS implements IEnvio {
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando SMS para " + notificacao.getDestinatario().getContato());
    }
}

package strategy;

import model.Notificacao;

public class Push implements IEnvio {
    public void enviar(Notificacao notificacao) {
        System.out.println("Enviando Push para " + notificacao.getDestinatario().getContato());
    }
}