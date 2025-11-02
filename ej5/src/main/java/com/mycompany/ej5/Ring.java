package com.mycompany.ej5;

public class Ring {
    private boolean turnoBoxeador1 = true;
    
    public synchronized void pelear(Boxeador boxeador) {
        try {
            while (!esTurno(boxeador)) {
                wait();
            }
            
            if (boxeador.getGolpesDados() < 26 && boxeador.getRival().getGolpesDados() < 26) {
                boxeador.darGolpe();
                turnoBoxeador1 = !turnoBoxeador1;
                notifyAll();
                verificarGanador(boxeador);
            }
            
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    private boolean esTurno(Boxeador boxeador) {
        return (turnoBoxeador1 && boxeador.getNombre().equals("Ali")) ||
               (!turnoBoxeador1 && boxeador.getNombre().equals("Tyson"));
    }
    
    private void verificarGanador(Boxeador boxeador) {
        if (boxeador.getGolpesDados() >= 26) {
            System.out.println("🎉 " + boxeador.getNombre() + " GANA!");
            System.exit(0);
        } else if (boxeador.getRival().getGolpesDados() >= 26) {
            System.out.println("🎉 " + boxeador.getRival().getNombre() + " GANA!");
            System.exit(0);
        }
    }
}