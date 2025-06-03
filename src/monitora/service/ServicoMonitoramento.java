package service;

import enums.Prioridade;
import enums.TipoAlerta;
import java.util.ArrayList;
import java.util.List;
import model.PessoaCuidador;
import model.PessoaMonitorada;
import model.ResultadoAnalise;
import model.Sensor;
import notification.Notificacao;
import observer.ListenerQueda;
import observer.RegistradorLog;




public class ServicoMonitoramento {
    private List<ListenerQueda> observadores; // Observa (dependência)
    private ServicoQueda servicoQueda; // Usa (dependência)
    private AnalisadorPostura analisadorPostura; // Usa (dependência)

    public ServicoMonitoramento() {
        this.observadores = new ArrayList<>();
        this.servicoQueda = new ServicoQueda();
        this.analisadorPostura = new AnalisadorPostura(); // Initialized here
        adicionarObservador(RegistradorLog.getInstance()); // Adiciona o logger singleton
        System.out.println("[ServicoMonitoramento] ServicoMonitoramento inicializado.");
    }

    public Monitoramento criarMonitoramento(PessoaCuidador cuidador, PessoaMonitorada pessoaMonitorada, Sensor sensor, int deltaVariacaoGraus, int tempoParadoSegundos) {
        Monitoramento monitoramento = new Monitoramento(deltaVariacaoGraus, tempoParadoSegundos, sensor, cuidador, pessoaMonitorada);
        pessoaMonitorada.adicionarMonitoramento(monitoramento); // Adiciona ao histórico da pessoa monitorada
        System.out.println("[ServicoMonitoramento] Monitoramento criado com sucesso.");
        return monitoramento;
    }

    public ResultadoAnalise processarMonitoramento(Monitoramento m) {
        System.out.println("[ServicoMonitoramento] Processando monitoramento para " + m.getPessoaMonitoradaAssociada().getNome() + "...");

        // Exemplo de uso do AnalisadorPostura dentro do serviço (para remover o warning)
        // Em um cenário real, estes métodos seriam usados para transformar ou validar dados
        System.out.println("[ServicoMonitoramento] DEBUG: AnalisadorPostura - normalizando 90 graus: " + analisadorPostura.normalizarAngulo(90));
        System.out.println("[ServicoMonitoramento] DEBUG: AnalisadorPostura - calculando variacao (0 a 180): " + analisadorPostura.calcularVariacao(0, 180));


        ResultadoAnalise resultado = servicoQueda.analisar(m);
        m.setResultado(resultado); // Seta o resultado no monitoramento

        if (resultado.isCritico()) {
            System.out.println("[ServicoMonitoramento] Situação crítica detectada: " + resultado.getSituacao() + ". Notificando observadores.");
            notificarObservadores(m, resultado);

            // A lógica de criar e enviar a notificação para o cuidador diretamente aqui
            for (PessoaCuidador cuidador : m.getPessoaMonitoradaAssociada().getCuidadores()) {
                Notificacao notificacao = criarNotificacao(resultado, cuidador);
                notificacao.enviar(); // Envia a notificação
            }
        } else {
            System.out.println("[ServicoMonitoramento] Situação normal: " + resultado.getSituacao() + ".");
        }
        return resultado;
    }

    public List<Monitoramento> recuperarMonitoramentos(PessoaCuidador cuidador) {
        System.out.println("[ServicoMonitoramento] Recuperando monitoramentos para o cuidador " + cuidador.getNome() + "...");
        List<Monitoramento> monitoramentosDoCuidador = new ArrayList<>();
        for (PessoaMonitorada pm : cuidador.getPessoasMonitoradas()) {
            monitoramentosDoCuidador.addAll(pm.getHistorico());
        }
        System.out.println("[ServicoMonitoramento] " + monitoramentosDoCuidador.size() + " monitoramentos recuperados.");
        return monitoramentosDoCuidador;
    }

    public void adicionarObservador(ListenerQueda obs) {
        this.observadores.add(obs);
        System.out.println("[ServicoMonitoramento] Observador " + obs.getClass().getSimpleName() + " adicionado.");
    }

    public void removerObservador(ListenerQueda obs) {
        this.observadores.remove(obs);
        System.out.println("[ServicoMonitoramento] Observador " + obs.getClass().getSimpleName() + " removido.");
    }

    public void notificarObservadores(Monitoramento m, ResultadoAnalise r) {
        for (ListenerQueda obs : observadores) {
            obs.onQuedaDetectada(m, r);
        }
    }

    public Notificacao criarNotificacao(ResultadoAnalise r, PessoaCuidador destinatario) {
        Prioridade prioridade = r.isCritico() ? Prioridade.Alta : Prioridade.Baixa;
        TipoAlerta tipoAlerta = Prioridade.Alta.equals(prioridade) ? TipoAlerta.Push : TipoAlerta.Email; // Exemplo de lógica para tipo
        System.out.println("[ServicoMonitoramento] Criando notificação para " + destinatario.getNome() + " (Prioridade: " + prioridade + ", Tipo: " + tipoAlerta + ").");
        return new Notificacao(prioridade, tipoAlerta, destinatario, r);
    }
}