import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Music, Gamepad2 } from 'lucide-react';

interface AudioSettingsProps {
  className?: string;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ className = '' }) => {
  const [masterVolume, setMasterVolume] = React.useState(0.5);
  const [sfxVolume, setSfxVolume] = React.useState(0.6);
  const [musicVolume, setMusicVolume] = React.useState(0.4);
  const [isMuted, setIsMuted] = React.useState(false);

  const handleMasterVolumeChange = (value: number[]) => {
    const volume = value[0];
    setMasterVolume(volume);
    // Aquí iría la lógica para cambiar el volumen maestro
  };

  const handleSfxVolumeChange = (value: number[]) => {
    const volume = value[0];
    setSfxVolume(volume);
    // Aquí iría la lógica para cambiar el volumen de efectos de sonido
  };

  const handleMusicVolumeChange = (value: number[]) => {
    const volume = value[0];
    setMusicVolume(volume);
    // Aquí iría la lógica para cambiar el volumen de música
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    // Aquí iría la lógica para silenciar/desactivar audio
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Configuración de Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control maestro */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volumen Maestro
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMuteToggle(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground w-12">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
              disabled={isMuted}
            />
          </div>

          {/* Efectos de sonido */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Efectos de Sonido
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">
                {Math.round(sfxVolume * 100)}%
              </span>
              <Slider
                value={[sfxVolume]}
                onValueChange={handleSfxVolumeChange}
                max={1}
                min={0}
                step={0.01}
                className="flex-1"
                disabled={isMuted}
              />
            </div>
          </div>

          {/* Música */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Música de Fondo
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">
                {Math.round(musicVolume * 100)}%
              </span>
              <Slider
                value={[musicVolume]}
                onValueChange={handleMusicVolumeChange}
                max={1}
                min={0}
                step={0.01}
                className="flex-1"
                disabled={isMuted}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
