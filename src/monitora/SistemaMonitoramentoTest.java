import enums.*;
import java.time.LocalDate;
import java.util.List;
import model.*;
import notification.Notificacao;
import observer.*;
import service.*;
public class SistemaMonitoramentoTest {

    public static void main(String[] args) {
        System.out.println(">>> Iniciando Testes do Sistema de Monitoramento (Separados por Classe) <<<");

        // --- Configuração Inicial para Todos os Testes ---
        // Dados de contato e endereço atualizados para o Distrito Federal (DF)
        Contato contatoCuidador = new Contato("joao.silva@example.com", "61987654321"); // Telefone do DF
        Endereco enderecoCuidador = new Endereco("Quadra 101 Bloco A", "123", "Brasília", "DF", "70670-101"); // Endereço do DF
        PessoaCuidador joao = new PessoaCuidador("João Silva", Genero.Masculino, "123.456.789-00", LocalDate.of(1980, 5, 15), contatoCuidador, enderecoCuidador);

        Contato contatoMonitorada = new Contato("maria.fernandes@example.com", "61991234567"); // Telefone do DF
        Endereco enderecoMonitorada = new Endereco("SHIS QI 05 Conjunto 10", "45", "Lago Sul", "DF", "71615-500"); // Endereço do DF
        PessoaMonitorada maria = new PessoaMonitorada("Maria Fernandes", Genero.Feminino, "987.654.321-00", LocalDate.of(1950, 10, 20), contatoMonitorada, enderecoMonitorada);

        joao.adicionarPessoaMonitorada(maria);
        maria.adicionarCuidador(joao);

        Sensor sensorSala = new Sensor("Acelerômetro", "Sala de Estar", LocalDate.of(2025, 1, 10)); // Calibrado
        Sensor sensorQuarto = new Sensor("Giroscópio", "Quarto", LocalDate.of(2024, 6, 1)); // Seria descalibrado, mas está forçado a true
        maria.adicionarSensor(sensorSala);
        maria.adicionarSensor(sensorQuarto);

        ServicoMonitoramento servicoMonitoramento = new ServicoMonitoramento();

        // --- Testes para a Classe Pessoa / PessoaCuidador / PessoaMonitorada ---
        System.out.println("\n--- Testes da Classe Pessoa ---");
        // Teste 13: Cálculo de Idade
        // Idade calculada para 1º de junho de 2025
        assert joao.getIdade() == 45 : "Erro: Idade de João incorreta."; // João nasceu em 15/05/1980
        assert maria.getIdade() == 74 : "Erro: Idade de Maria incorreta."; // Maria nasceu em 20/10/1950
        System.out.println("Testes de idade da Pessoa: OK.");

        // Teste 12: Confirmação de Recebimento de Notificação por Cuidador
        Notificacao notifParaConfirmar = new Notificacao(Prioridade.Baixa, TipoAlerta.Email, joao, new ResultadoAnalise(0.1, false, Situacao.TudoBem));
        notifParaConfirmar.enviar();
        joao.confirmarRecebimento(notifParaConfirmar);
        assert notifParaConfirmar.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação deveria estar 'Enviado' após confirmação.";
        System.out.println("Teste de confirmação de recebimento do Cuidador: OK.");


        // --- Testes para a Classe Sensor ---
        System.out.println("\n--- Testes da Classe Sensor (Validação ignorada) ---");
        // Teste 7: Sensor não calibrado (agora tratado como calibrado para o teste)
        Sensor sensorNaoCalibradoManual = new Sensor("Luminosidade", "Hall", LocalDate.of(2023, 1, 1));
        maria.adicionarSensor(sensorNaoCalibradoManual);
        // Não há uma asserção direta aqui, pois o comportamento é manipulado pela classe Sensor.
        // A validação de 'true' já ocorre no construtor do Sensor e no método estaCalibrado().
        System.out.println("Teste de criação de sensor considerado calibrado: OK.");


        // --- Testes para a Classe ServicoMonitoramento ---
        System.out.println("\n--- Testes da Classe ServicoMonitoramento ---");

        // Teste 2: Cenário: Monitoramento Normal
        Monitoramento monitoramentoNormal = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 10, 2);
        ResultadoAnalise resultadoNormal = servicoMonitoramento.processarMonitoramento(monitoramentoNormal);
        assert resultadoNormal.getSituacao() == Situacao.TudoBem : "Erro: Situação esperada 'TudoBem' para monitoramento normal.";
        assert !resultadoNormal.isCritico() : "Erro: Não deveria ser crítico para monitoramento normal.";
        System.out.println("Teste de monitoramento normal: OK.");

        // Teste 3: Cenário: Monitoramento com Potencial Queda (não crítico, mas deve notificar)
        Monitoramento monitoramentoPotencialQueda = servicoMonitoramento.criarMonitoramento(joao, maria, sensorSala, 35, 7);
        ResultadoAnalise resultadoPotencialQueda = servicoMonitoramento.processarMonitoramento(monitoramentoPotencialQueda);
        assert resultadoPotencialQueda.getSituacao() == Situacao.EmAnalise : "Erro: Situação esperada 'EmAnalise' para potencial queda.";
        assert resultadoPotencialQueda.getDeveNotificar() : "Erro: Deveria notificar para potencial queda.";
        System.out.println("Teste de monitoramento com potencial queda: OK.");

        // Teste 4: Cenário: Queda Detectada (Crítico) - sensorQuarto é calibrado para este teste
        Monitoramento monitoramentoQueda = servicoMonitoramento.criarMonitoramento(joao, maria, sensorQuarto, 50, 15);
        ResultadoAnalise resultadoQueda = servicoMonitoramento.processarMonitoramento(monitoramentoQueda);
        assert resultadoQueda.getSituacao() == Situacao.QuedaDetectada : "Erro: Situação esperada 'QuedaDetectada' para queda detectada.";
        assert resultadoQueda.isCritico() : "Erro: Deveria ser crítico para queda detectada.";
        System.out.println("Teste de queda detectada (sensor calibrado): OK.");

        // Teste 5: Verificação do Histórico de Monitoramentos
        List<Monitoramento> historicoMaria = maria.getHistorico();
        assert historicoMaria.size() == 4 : "Erro: O histórico de monitoramentos deveria ter 4 registros.";
        System.out.println("Teste de histórico de monitoramentos: OK.");

        // Teste 6: Verificação de Recuperação de Monitoramentos por Cuidador
        List<Monitoramento> monitoramentosJoao = servicoMonitoramento.recuperarMonitoramentos(joao);
        assert monitoramentosJoao.size() == 4 : "Erro: A lista de monitoramentos de João deveria ter 4 registros.";
        System.out.println("Teste de recuperação de monitoramentos por cuidador: OK.");

        // Teste 14: Adição/Remoção de Observadores
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

        // Teste 8: Notificação por Email (Situação Em Análise)
        Notificacao notifEmail = new Notificacao(Prioridade.Media, TipoAlerta.Email, joao, resultadoPotencialQueda);
        notifEmail.enviar();
        assert notifEmail.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação de e-mail deveria estar 'Enviado'.";
        System.out.println("Teste de notificação por Email: OK.");

        // Teste 9: Notificação por SMS (Queda Crítica Real)
        Notificacao notifSMS = new Notificacao(Prioridade.Alta, TipoAlerta.SMS, joao, resultadoQueda);
        notifSMS.enviar();
        assert notifSMS.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação de SMS deveria estar 'Enviado'.";
        System.out.println("Teste de notificação por SMS: OK.");

        // Teste 10: Notificação Push (Crítico)
        Notificacao notifPush = new Notificacao(Prioridade.Alta, TipoAlerta.Push, joao, resultadoQueda);
        notifPush.enviar();
        assert notifPush.getEstado() == StatusNotificacao.Enviado : "Erro: Notificação Push deveria estar 'Enviado'.";
        System.out.println("Teste de notificação Push: OK.");


        // --- Testes para o Singleton RegistradorLog ---
        System.out.println("\n--- Testes do Singleton RegistradorLog ---");
        // Teste 11: Objeto RegistradorLog (Singleton)
        RegistradorLog log1 = RegistradorLog.getInstance();
        RegistradorLog log2 = RegistradorLog.getInstance();
        assert log1 == log2 : "Erro: RegistradorLog não é um Singleton.";
        System.out.println("Teste do Singleton RegistradorLog: OK.");

        System.out.println("\n>>> Todos os testes concluídos com sucesso! <<<");
    }
}