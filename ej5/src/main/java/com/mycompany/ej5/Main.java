package com.mycompany.ej5;

public class Main {
    public static void main(String[] args) {
        System.out.println("🏆 PELEA DE BOXEO 🏆");
        
        Ring ring = new Ring();
        
        Boxeador boxeador1 = new Boxeador("Ali", ring);
        Boxeador boxeador2 = new Boxeador("Tyson", ring);
        
        boxeador1.setRival(boxeador2);
        boxeador2.setRival(boxeador1);
        
        boxeador1.start();
        boxeador2.start();
        
        try {
            boxeador1.join();
            boxeador2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        System.out.println("Fin del programa.");
    }
}