import { Component, Input, computed } from '@angular/core';
import {
  LucideArrowUpRight,
  LucideAtSign,
  LucideBuilding2,
  LucideCheck,
  LucideChevronRight,
  LucideGlobe,
  LucideGraduationCap,
  LucideHandCoins,
  LucideHandHeart,
  LucideHandshake,
  LucideHeart,
  LucideHeartHandshake,
  LucideHeartPulse,
  LucideLanguages,
  LucideLeaf,
  LucideLifeBuoy,
  LucideMail,
  LucideMailCheck,
  LucideMapPin,
  LucideMegaphone,
  LucideMenu,
  LucideMessageCircleHeart,
  LucidePhone,
  LucideRoute,
  LucideSend,
  LucideShieldCheck,
  LucideSparkles,
  LucideSpeech,
  LucideSun,
  LucideMoon,
  LucideTent,
  LucideTriangleAlert,
  LucideUsersRound,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';

const ICONS = {
  'arrow-up-right': LucideArrowUpRight.icon,
  'at-sign': LucideAtSign.icon,
  'building-2': LucideBuilding2.icon,
  check: LucideCheck.icon,
  'chevron-right': LucideChevronRight.icon,
  globe: LucideGlobe.icon,
  'graduation-cap': LucideGraduationCap.icon,
  'hand-coins': LucideHandCoins.icon,
  'hand-heart': LucideHandHeart.icon,
  handshake: LucideHandshake.icon,
  heart: LucideHeart.icon,
  'heart-handshake': LucideHeartHandshake.icon,
  'heart-pulse': LucideHeartPulse.icon,
  languages: LucideLanguages.icon,
  leaf: LucideLeaf.icon,
  'life-buoy': LucideLifeBuoy.icon,
  mail: LucideMail.icon,
  'mail-check': LucideMailCheck.icon,
  'map-pin': LucideMapPin.icon,
  megaphone: LucideMegaphone.icon,
  menu: LucideMenu.icon,
  'message-circle-heart': LucideMessageCircleHeart.icon,
  phone: LucidePhone.icon,
  route: LucideRoute.icon,
  send: LucideSend.icon,
  'shield-check': LucideShieldCheck.icon,
  sparkles: LucideSparkles.icon,
  speech: LucideSpeech.icon,
  sun: LucideSun.icon,
  moon: LucideMoon.icon,
  tent: LucideTent.icon,
  'triangle-alert': LucideTriangleAlert.icon,
  'users-round': LucideUsersRound.icon,
  x: LucideX.icon,
} as const satisfies Record<string, LucideIconData>;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (node of nodes(); track $index) {
        @switch (node[0]) {
          @case ('path') {
            <path
              [attr.d]="node[1]['d']"
              [attr.fill]="node[1]['fill']"
              [attr.stroke]="node[1]['stroke']"
              [attr.stroke-width]="node[1]['stroke-width']"
            />
          }
          @case ('circle') {
            <circle
              [attr.cx]="node[1]['cx']"
              [attr.cy]="node[1]['cy']"
              [attr.r]="node[1]['r']"
              [attr.fill]="node[1]['fill']"
            />
          }
          @case ('rect') {
            <rect
              [attr.x]="node[1]['x']"
              [attr.y]="node[1]['y']"
              [attr.width]="node[1]['width']"
              [attr.height]="node[1]['height']"
              [attr.rx]="node[1]['rx']"
              [attr.ry]="node[1]['ry']"
            />
          }
          @case ('line') {
            <line
              [attr.x1]="node[1]['x1']"
              [attr.y1]="node[1]['y1']"
              [attr.x2]="node[1]['x2']"
              [attr.y2]="node[1]['y2']"
            />
          }
          @case ('polyline') {
            <polyline [attr.points]="node[1]['points']" />
          }
          @case ('polygon') {
            <polygon [attr.points]="node[1]['points']" />
          }
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        line-height: 0;
      }
      svg {
        width: 100%;
        height: 100%;
        stroke-width: 2.1;
      }
    `,
  ],
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;

  protected readonly nodes = computed(() => ICONS[this.name]?.node ?? []);
}
