import React from "react";
import   { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
export default function GradientBackground({
     children, 
     style,
    colors= ['#5B8CFF', '#8A5BFF'] ,
       start = { x: 0, y: 0 }, end = { x: 1, y: 1 },
       overlay = false })
        {
        return(<LinearGradient 
            colors={colors} 
            start={start} 
            end={end} 
            style={[styles.container, style]} > 
            {overlay && <View style={styles.overlay} />} {children} </LinearGradient> ); }


const styles = StyleSheet.create({
    container: { 
        flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject,
         backgroundColor: 'rgba(255, 255, 255, 0.3)' ,
         borderRadius: 20,},
});