package model;

import enums.Genero;
import java.time.LocalDate;
import java.time.Period;

public abstract class Pessoa {
    protected String nome;
    protected Genero genero;
    protected String cpf;
    protected LocalDate dataDeNascimento;
    protected Contato contato; // Composição
    protected Endereco endereco; // Composição

    public Pessoa(String nome, Genero genero, String cpf, LocalDate dataDeNascimento, Contato contato, Endereco endereco) {
        this.nome = nome;
        this.genero = genero;
        this.cpf = cpf;
        this.dataDeNascimento = dataDeNascimento;
        this.contato = contato;
        this.endereco = endereco;
    }

    public String getNome() {
        return nome;
    }

    public Contato getContato() {
        return contato;
    }

    public int getIdade() {
        if (dataDeNascimento == null) {
            return 0;
        }
        return Period.between(dataDeNascimento, LocalDate.now()).getYears();
    }
}