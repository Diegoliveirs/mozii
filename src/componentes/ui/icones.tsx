/*
 * Iconografia oficial do Mozii — Phosphor com nomes em português.
 *
 * Este é o ÚNICO arquivo que importa de @phosphor-icons/react; o resto do
 * app usa os apelidos daqui. Convenção de peso: weight="regular" no estado
 * normal e weight="fill" quando ativo/selecionado (padrão de app nativo).
 * Emoji continua permitido apenas como afeto em textos (💜, ♥) — nunca
 * como ícone de interface.
 */
export type { IconProps as PropsIcone, IconWeight as PesoIcone } from '@phosphor-icons/react'

export {
  /* Navegação principal */
  Chats as IconeMural,
  FilmSlate as IconeCinema,
  BookOpen as IconeMomentos,
  User as IconePerfil,
  Plus as IconeMais,

  /* Ações e navegação secundária */
  ArrowLeft as IconeVoltar,
  X as IconeFechar,
  CaretRight as IconeAvancar,
  GearSix as IconeAjustes,
  MagnifyingGlass as IconeBusca,
  ShareNetwork as IconeCompartilhar,
  Copy as IconeCopiar,
  Trash as IconeLixeira,
  PencilSimple as IconeEditar,
  PaperPlaneRight as IconeEnviar,
  SignOut as IconeSair,
  EnvelopeSimple as IconeEmail,
  Eye as IconeOlho,
  EyeSlash as IconeOlhoFechado,

  /* Cinema e sessões */
  Popcorn as IconeSessao,
  DiceFive as IconeSorteio,
  CalendarPlus as IconeCalendario,
  ClockCounterClockwise as IconeReagendar,
  FilmStrip as IconeFilme,
  Star as IconeEstrela,
  StarHalf as IconeMeiaEstrela,
  Television as IconeStreaming,

  /* Mural e momentos */
  Heart as IconeCoracao,
  ChatCircle as IconeComentario,
  Camera as IconeFoto,
  Image as IconeImagem,
  Confetti as IconeComemoracao,
  Footprints as IconePegadas,

  /* Feedback e notificações */
  CheckCircle as IconeConfirmado,
  WarningCircle as IconeAlerta,
  Bell as IconeSino,
  BellRinging as IconeSinoTocando,
  MinusCircle as IconeNeutro,
  Info as IconeInfo,
} from '@phosphor-icons/react'
