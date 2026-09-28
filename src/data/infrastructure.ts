import type { Localized } from '../i18n/types';
import type { TechId } from './stack';

/** A unit in the rack diagram. Hardware and platforms worked with — no counts, no benchmarks. */
export interface RackUnit {
  id: string;
  slot: string;
  kind: 'gpu' | 'cpu' | 'virtualisation' | 'storage' | 'cloud';
  name: string;
  note: Localized;
}

export const rackUnits: RackUnit[] = [
  { id: 'rtx3090', slot: 'U01', kind: 'gpu', name: 'NVIDIA RTX 3090', note: { en: 'multiple GPUs per machine', es: 'varias GPUs por máquina' } },
  { id: 'rtx4090', slot: 'U02', kind: 'gpu', name: 'NVIDIA RTX 4090', note: { en: 'multiple GPUs per machine', es: 'varias GPUs por máquina' } },
  { id: 'rtx5090', slot: 'U03', kind: 'gpu', name: 'NVIDIA RTX 5090', note: { en: 'latest-generation inference', es: 'inferencia de última generación' } },
  { id: 'rtx6000', slot: 'U04', kind: 'gpu', name: 'NVIDIA RTX 6000 Ada', note: { en: 'workstation-class GPU', es: 'GPU de clase workstation' } },
  { id: 'threadripper', slot: 'U05', kind: 'cpu', name: 'Threadripper PRO', note: { en: 'large amounts of RAM', es: 'gran cantidad de RAM' } },
  { id: 'proxmox', slot: 'U06', kind: 'virtualisation', name: 'Proxmox · VMs', note: { en: 'QCOW2 · VHDX disks', es: 'discos QCOW2 · VHDX' } },
  { id: 'synology', slot: 'U07', kind: 'storage', name: 'Synology', note: { en: 'Container Manager · CIFS/Samba', es: 'Container Manager · CIFS/Samba' } },
  { id: 'vastai', slot: 'EXT', kind: 'cloud', name: 'Vast.ai', note: { en: 'GPU hosting marketplace', es: 'marketplace de hosting GPU' } },
];

export interface PlatformGroup {
  id: string;
  name: Localized;
  items: TechId[];
}

export const platformGroups: PlatformGroup[] = [
  { id: 'os', name: { en: 'Operating systems', es: 'Sistemas operativos' }, items: ['linux', 'ubuntu', 'lubuntu', 'dietpi', 'windows', 'wsl'] },
  { id: 'containers', name: { en: 'Containers', es: 'Contenedores' }, items: ['docker', 'compose', 'containerManager'] },
  { id: 'virtualisation', name: { en: 'Virtualisation', es: 'Virtualización' }, items: ['proxmox', 'vms', 'qcow2', 'vhdx'] },
  { id: 'storage', name: { en: 'Storage', es: 'Almacenamiento' }, items: ['synology', 'cifs'] },
  { id: 'gpu', name: { en: 'GPU compute', es: 'Cómputo GPU' }, items: ['nvidia', 'cuda', 'multiGpu', 'gpuInference', 'vastai'] },
];

export interface WatchedSignal {
  id: string;
  label: Localized;
}

/** What the monitoring systems watch. */
export const watchedSignals: WatchedSignal[] = [
  { id: 'cpu', label: { en: 'CPU', es: 'CPU' } },
  { id: 'ram', label: { en: 'RAM', es: 'RAM' } },
  { id: 'gpu', label: { en: 'GPU', es: 'GPU' } },
  { id: 'containers', label: { en: 'Containers', es: 'Contenedores' } },
  { id: 'network', label: { en: 'Network', es: 'Red' } },
  { id: 'processes', label: { en: 'Processes', es: 'Procesos' } },
  { id: 'services', label: { en: 'Services', es: 'Servicios' } },
  { id: 'cameras', label: { en: 'Cameras', es: 'Cámaras' } },
  { id: 'inference', label: { en: 'Inference', es: 'Inferencia' } },
  { id: 'servers', label: { en: 'Servers', es: 'Servidores' } },
];

export const observabilityTools: { id: TechId; role: Localized }[] = [
  { id: 'glances', role: { en: 'live host overview', es: 'vista en vivo del host' } },
  { id: 'iftop', role: { en: 'bandwidth per connection', es: 'ancho de banda por conexión' } },
  { id: 'nmap', role: { en: 'network and service discovery', es: 'descubrimiento de red y servicios' } },
  { id: 'netdiscover', role: { en: 'device discovery', es: 'descubrimiento de dispositivos' } },
  { id: 'arpScan', role: { en: 'LAN inventory', es: 'inventario de la LAN' } },
  { id: 'tcpdump', role: { en: 'packet capture', es: 'captura de paquetes' } },
  { id: 'tshark', role: { en: 'traffic analysis', es: 'análisis de tráfico' } },
  { id: 'suricata', role: { en: 'intrusion detection · defensive', es: 'detección de intrusiones · defensiva' } },
];
