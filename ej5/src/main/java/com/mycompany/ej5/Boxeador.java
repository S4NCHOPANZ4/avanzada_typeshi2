package com.mycompany.ej5;

import java.util.Random;

public class Boxeador extends Thread {
    private String nombre;
    private int golpesDados;
    private Boxeador rival;
    private boolean noqueado;
    private Random random;
    private Ring ring;
    
    public Boxeador(String nombre, Ring ring) {
        this.nombre = nombre;
        this.golpesDados = 0;
        this.noqueado = false;
        this.random = new Random();
        this.ring = ring;
    }
    
    public void setRival(Boxeador rival) {
        this.rival = rival;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public int getGolpesDados() {
        return golpesDados;
    }
    
    public Boxeador getRival() {
        return rival;
    }
    
    public void recibirGolpe() {
        if (random.nextDouble() < 0.3) {
            noqueado = true;
            System.out.println("¡" + nombre + " NOQUEADO!");
            try {
                Thread.sleep(random.nextInt(250));
                noqueado = false;
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    public void darGolpe() {
        if (!noqueado) {
            golpesDados++;
            System.out.println(nombre + " golpea! Total: " + golpesDados);
            rival.recibirGolpe();
            try {
                Thread.sleep(random.nextInt(500));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    @Override
    public void run() {
        while (golpesDados < 26 && rival.getGolpesDados() < 26) {
            ring.pelear(this);
        }
    }
}