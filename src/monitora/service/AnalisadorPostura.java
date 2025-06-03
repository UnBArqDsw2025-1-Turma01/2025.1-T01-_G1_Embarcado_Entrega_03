package service;

public class AnalisadorPostura {
    public AnalisadorPostura() {
        System.out.println("[AnalisadorPostura] AnalisadorPostura inicializado.");
    }
    public int calcularVariacao(int anguloInicial, int anguloFinal) {
        int variacao = normalizarAngulo(anguloFinal) - normalizarAngulo(anguloInicial);
        System.out.println("[AnalisadorPostura] Calculando variação de ângulo: " + anguloInicial + " -> " + anguloFinal + " = " + Math.abs(variacao) + " graus.");
        return Math.abs(variacao);
    }

    public int calcularTempoParado(int tempoInicial, int tempoFinal) {
        int tempoParado = tempoFinal - tempoInicial;
        System.out.println("[AnalisadorPostura] Calculando tempo parado: " + tempoParado + " segundos.");
        return tempoParado;
    }

    public int normalizarAngulo(int a) {
        // Normaliza o ângulo para o intervalo [0, 359]
        int normalized = (a % 360 + 360) % 360;
        System.out.println("[AnalisadorPostura] Normalizando ângulo " + a + " para " + normalized + ".");
        return normalized;
    }
}