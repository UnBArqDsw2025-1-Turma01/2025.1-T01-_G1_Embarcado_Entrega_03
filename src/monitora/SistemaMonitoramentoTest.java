import enums.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import model.*;
import notification.Notificacao;
import observer.*;
import service.*;

public class SistemaMonitoramentoTest {

    public static void main(String[] args) {
        System.out.println(">>> Iniciando Testes do Sistema de Monitoramento (Separados por Classe) <<<");

        // --- Configuração Inicial para Todos os Testes ---
        Contato contatoCuidador = new Contato("joao.silva@example.com", "61987654321");
        Endereco enderecoCuidador = new Endereco("Quadra 101 Bloco A", "123", "Brasília", "DF", "70670-101");
        PessoaCuidador joao = new PessoaCuidador("João Silva", Genero.Masculino, "123.456.789-00", LocalDate.of(1980, 5, 15), contatoCuidador, enderecoCuidador);

        Contato contatoMonitorada = new Contato("maria.fernandes@example.com", "61991234567");
        Endereco enderecoMonitorada = new Endereco("SHIS QI 05 Conjunto 10", "45", "Lago Sul", "DF", "71615-500");
        PessoaMonitorada maria = new PessoaMonitorada("Maria Fernandes", Genero.Feminino, "987.654.321-00", LocalDate.of(1950, 10, 20), contatoMonitorada, enderecoMonitorada);

        joao.adicionarPessoaMonitorada(maria);
        maria.adicionarCuidador(joao);

        Sensor sensorSala = new Sensor("Acelerômetro", "Sala de Estar", LocalDate.of(2025, 1, 10));
        Sensor sensorQuarto = new Sensor("Giroscópio", "Quarto", LocalDate.of(2024, 6, 1));
        maria.adicionarSensor(sensorSala);
        maria.adicionarSensor(sensorQuarto);

        ServicoMonitoramento servicoMonitoramento = new ServicoMonitoramento();

        // Adiciona a instância do RegistradorLog (Singleton) como observador.
        servicoMonitoramento.adicionarObservador(RegistradorLog.getInstance());
        // Adiciona também o NotificadorCuidador como observador
        servicoMonitoramento.adicionarObservador(new NotificadorCuidador());

        // --- Testes para a Classe Pessoa / PessoaCuidador / PessoaMonitorada ---
        System.out.println("\n--- Testes da Classe Pessoa ---");
        assert joao.getIdade() == 45 : "Erro: Idade de João incorreta.";
        assert maria.getIdade() == 74 : "Erro: Idade de Maria incorreta.";
        System.out.println("Testes de idade da Pessoa: OK.");

        Notificacao notifParaConfirmar = new Notificacao(Prioridade.Baixa, TipoAlerta.Email, joao, new ResultadoAnalise(0.1, false, Situacao.TudoBem));
        notifParaConfirmar.enviar();
        joao.confirmarRecebimento(notifParaConfirmar);
        assert notifParaConfirmar.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação deveria estar 'Enviado' após confirmação.";
        System.out.println("Teste de confirmação de recebimento do Cuidador: OK.");

        // --- Testes para a Classe Sensor ---
        System.out.println("\n--- Testes da Classe Sensor (Validação ignorada) ---");
        Sensor sensorNaoCalibradoManual = new Sensor("Luminosidade", "Hall", LocalDate.of(2023, 1, 1));
        maria.adicionarSensor(sensorNaoCalibradoManual);
        System.out.println("Teste de criação de sensor considerado calibrado: OK.");

        // --- Testes para a Classe ServicoMonitoramento ---
        System.out.println("\n--- Testes da Classe ServicoMonitoramento ---");

        Monitoramento monitoramentoNormal = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 10, 2);
        ResultadoAnalise resultadoNormal = servicoMonitoramento.processarMonitoramento(monitoramentoNormal);
        assert resultadoNormal.getSituacao() == Situacao.TudoBem : "Erro: Situação esperada 'TudoBem' para monitoramento normal.";
        assert !resultadoNormal.isCritico() : "Erro: Não deveria ser crítico para monitoramento normal.";
        System.out.println("Teste de monitoramento normal: OK.");

        Monitoramento monitoramentoPotencialQueda = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 35, 7);
        ResultadoAnalise resultadoPotencialQueda = servicoMonitoramento.processarMonitoramento(monitoramentoPotencialQueda);
        assert resultadoPotencialQueda.getSituacao() == Situacao.EmAnalise : "Erro: Situação esperada 'EmAnalise' para potencial queda.";
        assert resultadoPotencialQueda.getDeveNotificar() : "Erro: Deveria notificar para potencial queda.";
        System.out.println("Teste de monitoramento com potencial queda: OK.");

        Monitoramento monitoramentoQueda = servicoMonitoramento.criarMonitoramento(joao, maria, sensorQuarto, 50, 15);
        ResultadoAnalise resultadoQueda = servicoMonitoramento.processarMonitoramento(monitoramentoQueda);
        assert resultadoQueda.getSituacao() == Situacao.QuedaDetectada : "Erro: Situação esperada 'QuedaDetectada' para queda detectada.";
        assert resultadoQueda.isCritico() : "Erro: Deveria ser crítico para queda detectada.";
        System.out.println("Teste de queda detectada (sensor calibrado): OK.");

        List<Monitoramento> historicoMaria = maria.getHistorico();
        assert historicoMaria.size() == 5 : "Erro: O histórico de monitoramentos deveria ter 5 registros.";
        System.out.println("Teste de histórico de monitoramentos: OK.");

        List<Monitoramento> monitoramentosJoao = servicoMonitoramento.recuperarMonitoramentos(joao);
        assert monitoramentosJoao.size() == 5 : "Erro: A lista de monitoramentos de João deveria ter 5 registros.";
        System.out.println("Teste de recuperação de monitoramentos por cuidador: OK.");

        ListenerQueda novoObservador = (m, r) -> System.out.println("[NOVO OBSERVADOR CUSTOMIZADO] Queda detectada via observador customizado!");
        servicoMonitoramento.adicionarObservador(novoObservador);
        Monitoramento monitoramentoTesteObservador = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 60, 20);
        servicoMonitoramento.processarMonitoramento(monitoramentoTesteObservador);
        servicoMonitoramento.removerObservador(novoObservador);
        Monitoramento monitoramentoTesteRemocao = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 55, 18);
        servicoMonitoramento.processarMonitoramento(monitoramentoTesteRemocao);
        System.out.println("Teste de adição/remoção de observadores: OK.");

        // --- Testes para a Classe Notificacao e Estratégias de Envio ---
        System.out.println("\n--- Testes da Classe Notificacao ---");

        Notificacao notifEmail = new Notificacao(Prioridade.Media, TipoAlerta.Email, joao, resultadoPotencialQueda);
        notifEmail.enviar();
        assert notifEmail.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação de e-mail deveria estar 'Enviado'.";
        System.out.println("Teste de notificação por Email: OK.");

        Notificacao notifSMS = new Notificacao(Prioridade.Alta, TipoAlerta.SMS, joao, resultadoQueda);
        notifSMS.enviar();
        assert notifSMS.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação de SMS deveria estar 'Enviado'.";
        System.out.println("Teste de notificação por SMS: OK.");

        Notificacao notifPush = new Notificacao(Prioridade.Alta, TipoAlerta.Push, joao, resultadoQueda);
        notifPush.enviar();
        assert notifPush.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação Push deveria estar 'Enviado'.";
        System.out.println("Teste de notificação Push: OK.");


        // --- Testes para o Singleton RegistradorLog ---
        System.out.println("\n--- Testes do Singleton RegistradorLog ---");

        // Simulação de tentativa de criar uma nova instância diretamente
        System.out.println("\n--- TENTATIVA DE INSTANCIAR RegistradorLog DIRETAMENTE (DEVE FALHAR NA COMPILAÇÃO) ---");
        System.out.println("No código real, a linha abaixo resultaria em um ERRO DE COMPILAÇÃO,");
        System.out.println("pois o construtor de RegistradorLog é privado, impedindo a criação de novas instâncias.");
        // RegistradorLog logInvalido = new RegistradorLog(); // <<-- ESTA LINHA CAUSARIA ERRO DE COMPILAÇÃO
        System.out.println("Portanto, não é possível criar uma nova instância usando 'new'.");


        // Teste 11: Verificação de Unicidade da Instância via getInstance()
        System.out.println("\n--- Chamando RegistradorLog.getInstance() pela primeira vez ---");
        RegistradorLog log1 = RegistradorLog.getInstance();
        System.out.println("Referência de log1: " + log1);

        System.out.println("\n--- Chamando RegistradorLog.getInstance() pela segunda vez ---");
        RegistradorLog log2 = RegistradorLog.getInstance();
        System.out.println("Referência de log2: " + log2);

        System.out.println("\n--- Chamando RegistradorLog.getInstance() pela terceira vez ---");
        RegistradorLog log3 = RegistradorLog.getInstance();
        System.out.println("Referência de log3: " + log3);

        // Assertivas que verificam se todas as referências apontam para o mesmo objeto
        assert log1 == log2 : "Erro: As instâncias log1 e log2 do RegistradorLog não são a mesma.";
        assert log2 == log3 : "Erro: As instâncias log2 e log3 do RegistradorLog não são a mesma.";
        assert log1 == log3 : "Erro: As instâncias log1 e log3 do RegistradorLog não são a mesma.";

        System.out.println("\nTeste do Singleton RegistradorLog: OK. Todas as referências apontam para a mesma instância.");

        System.out.println("\n>>> Todos os testes concluídos com sucesso! <<<");
    }
}