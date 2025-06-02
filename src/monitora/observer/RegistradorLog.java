package observer;

import model.ResultadoAnalise;
import service.Monitoramento;

public class RegistradorLog implements ListenerQueda {
    private static RegistradorLog instance;

    private RegistradorLog() {
        // Construtor privado para implementar o Singleton
        System.out.println("[RegistradorLog] Instância do RegistradorLog criada.");
    }

    public static RegistradorLog getInstance() {
        if (instance == null) {
            instance = new RegistradorLog();
        }
        return instance;
    }

    @Override
    public void onQuedaDetectada(Monitoramento m, ResultadoAnalise r) {
        System.out.println("[RegistradorLog] Queda detectada e registrada no log. " + m.getResumo() + " - Risco: " + r.getRiscoQueda());
    }
}