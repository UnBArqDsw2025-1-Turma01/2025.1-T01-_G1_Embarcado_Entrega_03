package notification;

public class EstrategiaSMS implements IEnvio {
    @Override
    public void enviar(Notificacao n) {
        System.out.println("[EstrategiaSMS] Enviando SMS para " + n.getDestinatario().getContato().getTelefone() + ": " + n.getBaseadaEmResultado().getResumo());
    }
}
