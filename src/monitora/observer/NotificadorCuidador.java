package observer;


import model.*;
import service.*;

public class NotificadorCuidador implements ListenerQueda {
    @Override
    public void onQuedaDetectada(Monitoramento m, ResultadoAnalise r) {
        System.out.println("[NotificadorCuidador] Queda detectada! Preparando notificação para " + m.getCuidadorAssociado().getNome());
    }
}
