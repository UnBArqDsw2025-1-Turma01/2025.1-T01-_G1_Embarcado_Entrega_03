public interface ISensorAdapter {
    float getDeltaGrau();
    int getDeltaTempo();
}

// Classe cliente: Monitoramento
import java.time.LocalDateTime;
import java.time.LocalDate;

public class Monitoramento {
    private Situacao situacao;
    private int deltaVariacaoGraus;
    private int tempoParadoSegundo;
    private LocalDateTime dataHora;
    private ISensorAdapter sensor;
    private ResultadoAnalise resultado;

    public Monitoramento(Situacao situacao, ISensorAdapter sensor) {
        this.situacao = situacao;
        this.sensor = sensor;
        this.deltaVariacaoGraus = Math.round(sensor.getDeltaGrau());
        this.tempoParadoSegundo = sensor.getDeltaTempo();
        this.dataHora = LocalDateTime.now();
        this.resultado = new ResultadoAnalise();
    }

    public String getResumo() {
        return "Situação: " + situacao +
                ", Graus: " + deltaVariacaoGraus +
                ", Tempo parado: " + tempoParadoSegundo + "s";
    }

    public ISensorAdapter getSensor() {
        return sensor;
    }

    public ResultadoAnalise getResultado() {
        return resultado;
    }
}

public class ResultadoAnalise {
    // Pode conter métodos como avaliar(), gerarRelatorio(), etc.
}
