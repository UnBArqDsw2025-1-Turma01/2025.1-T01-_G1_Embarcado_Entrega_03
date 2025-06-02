package observer;

import model.ResultadoAnalise;
import service.Monitoramento;

public class RegistradorLog implements ListenerQueda {
    private static RegistradorLog instance;

    private RegistradorLog() {
        // Construtor privado para implementar o Singleton
        System.out.println("[RegistradorLog] CONSTRUTOR: Uma nova instância do RegistradorLog foi criada.");
    }

    public static RegistradorLog getInstance() {
        if (instance == null) {
            instance = new RegistradorLog();
        } else {
            // Mensagem de depuração para quando a instância já existe
            System.out.println("[RegistradorLog] getInstance(): Retornando a instância existente do RegistradorLog.");
        }
        return instance;
    }

    @Override
    public void onQuedaDetectada(Monitoramento m, ResultadoAnalise r) {
        System.out.println("[RegistradorLog] LOG EVENTO: Queda detectada e registrada. " + m.getResumo() + " - Risco: " + r.getRiscoQueda());
    }
}