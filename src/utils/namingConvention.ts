// Utilitários para convenção de nomenclatura Dogo com suporte a IA

interface FrameMetadata {
  ticketNumber?: string;
  variant?: string;
  petTactic?: string;
  dimension?: string;
  language?: string;
  [key: string]: any;
}

interface MetadataReadResult {
  data: FrameMetadata;
  source: 'pluginData' | 'name' | 'none';
  success: boolean;
}

export class NamingUtils {
  // Namespace para os dados do plugin
  private static readonly PLUGIN_NAMESPACE = 'dogo-ai-assistant';
  private static readonly METADATA_KEY = 'frameMetadata';

  /**
   * Lê os metadados do frame (tentando pluginData primeiro, depois parsing do nome)
   */
  static readFrameMetadata(frame: FrameNode): MetadataReadResult {
    try {
      // Tentativa 1: Ler do pluginData
      const pluginDataStr = frame.getPluginData(this.METADATA_KEY);
      if (pluginDataStr) {
        try {
          const data = JSON.parse(pluginDataStr);
          console.log(`📖 Metadados lidos do pluginData para frame "${frame.name}":`, data);
          return {
            data,
            source: 'pluginData',
            success: true
          };
        } catch (parseError) {
          console.log(`⚠️ Erro ao fazer parsing do pluginData: ${parseError}`);
        }
      }

      // Tentativa 2: Fazer parsing do nome do frame (convenção Dogo existente)
      // Exemplo formato antigo: "Ticket2025_V1_50x50_PT_Escassez"
      // Exemplo formato novo: "Dogo_972_v1_1080x1080_s_App_Top-Performers-Exp_T-Content_Grid-Fake-Comic-Style_EN_Multiple--______May25"
      
      // Tentar formato novo (NUMERO_vX_WIDTHxHEIGHT_...)
      // Exemplo: "6564_v1_1080x1080_s_App_Top-Performers-Exp_..."
      const newFormatPattern = /^(\d+)_(v\d+(?:AI)?)_(\d+x\d+)_(.+)$/i;
      const newMatch = frame.name.match(newFormatPattern);
      
      if (newMatch) {
        const data: FrameMetadata = {
          ticketNumber: newMatch[1], // Ex: "6564" (apenas o número)
          variant: newMatch[2],       // Ex: "v1"
          dimension: newMatch[3],     // Ex: "1080x1080"
          petTactic: newMatch[4]      // Todo o resto
        };
        console.log(`📖 Metadados extraídos do nome (formato novo) "${frame.name}":`, data);
        return {
          data,
          source: 'name',
          success: true
        };
      }
      
      // Tentar formato antigo (Ticket_XXX_V1_...)
      const oldFormatPattern = /^Ticket(\d+)_V(\d+(?:AI)?)(?:_([^_]+))?(?:_([^_]+))?(?:_(.+))?$/;
      const match = frame.name.match(oldFormatPattern);
      
      if (match) {
        const data: FrameMetadata = {
          ticketNumber: match[1],
          variant: match[2],
          dimension: match[3] || undefined,
          language: match[4] || undefined,
          petTactic: match[5] || undefined
        };
        console.log(`📖 Metadados extraídos do nome do frame "${frame.name}":`, data);
        return {
          data,
          source: 'name',
          success: true
        };
      }

      // Nenhuma fonte funcionou - retornar objeto vazio
      console.log(`📖 Nenhum metadado encontrado para frame "${frame.name}"`);
      return {
        data: {},
        source: 'none',
        success: false
      };

    } catch (error) {
      console.log(`❌ Erro ao ler metadados do frame "${frame.name}": ${error}`);
      return {
        data: {},
        source: 'none',
        success: false
      };
    }
  }

  /**
   * Salva os metadados no pluginData do frame
   */
  static saveFrameMetadata(frame: FrameNode, data: FrameMetadata): void {
    try {
      const dataStr = JSON.stringify(data);
      frame.setPluginData(this.METADATA_KEY, dataStr);
      console.log(`💾 Metadados salvos no pluginData para frame "${frame.name}":`, data);
    } catch (error) {
      console.log(`❌ Erro ao salvar metadados do frame "${frame.name}": ${error}`);
    }
  }

  /**
   * Gera o nome criativo do frame baseado nos metadados
   * Formato novo: Dogo_XXX_vX_WIDTHxHEIGHT_resto...
   * Formato antigo: Ticket[number]_V[variant]_[dimension]_[language]_[petTactic]
   */
  static generateCreativeName(frame: FrameNode, data: FrameMetadata): string {
    // Detectar formato: se ticketNumber é apenas dígitos, é formato novo
    const isNewFormat = data.ticketNumber && /^\d+$/.test(data.ticketNumber);
    
    if (isNewFormat) {
      // Formato novo: 6564_v1_1080x1080_resto...
      const parts: string[] = [];
      
      parts.push(data.ticketNumber!); // Ex: "6564" (apenas número)
      parts.push(data.variant || 'v1AI'); // Ex: "v1AI"
      parts.push(data.dimension || '1080x1080'); // Ex: "1080x1350"
      
      if (data.petTactic) {
        parts.push(data.petTactic); // Todo o resto
      }
      
      const finalName = parts.join('_');
      console.log(`🏷️ Nome gerado (formato novo): "${finalName}"`);
      return finalName;
      
    } else {
      // Formato antigo: Ticket2025_V1_50x50_PT_Escassez
      const parts: string[] = [];

      // Parte 1: Ticket number (obrigatório para convenção Dogo)
      if (data.ticketNumber) {
        parts.push(`Ticket${data.ticketNumber}`);
      } else {
        parts.push('TicketAI');
      }

      // Parte 2: Variant (obrigatório)
      if (data.variant) {
        parts.push(`V${data.variant}`);
      } else {
        parts.push('V1AI');
      }

      // Parte 3: Dimensão (opcional)
      if (data.dimension) {
        parts.push(data.dimension);
      }

      // Parte 4: Idioma (opcional)
      if (data.language) {
        parts.push(data.language);
      }

      // Parte 5: Pet Tactic (opcional)
      if (data.petTactic) {
        parts.push(data.petTactic);
      }

      const finalName = parts.join('_');
      console.log(`🏷️ Nome gerado (formato antigo): "${finalName}"`);
      return finalName;
    }
  }

  /**
   * Gera uma nova variante aleatória para IA
   * Formato: V[randomnumber]AI (exemplo: V123AI, V456AI)
   */
  static generateRandomVariant(): string {
    // Gerar número aleatório entre 1 e 999
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const variant = `${randomNum}AI`;
    console.log(`🎲 Variante aleatória gerada: ${variant}`);
    return variant;
  }

  /**
   * Gera um novo ticket number aleatório
   * Formato: número entre 4000 e 9000
   */
  static generateNewTicketNumber(): string {
    // Gerar número aleatório entre 4000 e 9000
    const randomNum = Math.floor(Math.random() * (9000 - 4000 + 1)) + 4000;
    const ticketNumber = randomNum.toString();
    console.log(`🎫 Ticket number gerado: ${ticketNumber}`);
    return ticketNumber;
  }

  /**
   * Verifica se um frame segue a convenção Dogo
   */
  static followsDogoConvention(frame: FrameNode): boolean {
    const result = this.readFrameMetadata(frame);
    return result.success && (result.source === 'pluginData' || result.source === 'name');
  }
}
