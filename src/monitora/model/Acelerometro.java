// Adaptee Acelerometro

public class Acelerometro {
    public float getAceleracaoX() {
        return 1.5f;
    }

    public float getAceleracaoY() {
        return 0.8f;
    }

    public String lerDadosBrutos() {
        return "dados acelerometro";
    }

    public void calibrar() {
        System.out.println("Acelerometro calibrado");
    }
}