package notification;

public class EstrategiaPush implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaPush] Enviando Notificação Push para " + n.getDestinatario().getNome() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}
