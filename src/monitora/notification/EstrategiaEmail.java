package notification;

public class EstrategiaEmail implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaEmail] Enviando E-mail para " + n.getDestinatario().getContato().getEmail() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}