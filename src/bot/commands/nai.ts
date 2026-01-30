import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { getImageService, ImageService } from "../services/image.js";
import {
  ModelChoices,
  type ModelChoiceKey,
  type SizeChoiceKey,
} from "../types/index.js";

@Discord()
export class NaiCommand {
  @Slash({
    description: "使用 NovelAI 生成图像",
    name: "nai",
  })
  async nai(
    @SlashOption({
      description: "正向提示词",
      name: "prompt",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    prompt: string,

    @SlashOption({
      description: "负向提示词",
      name: "negative",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    negative: string | undefined,

    @SlashChoice({ name: "NAI Diffusion V4.5 Full (推荐)", value: "V4.5" })
    @SlashChoice({ name: "NAI Diffusion V4.5 curated", value: "V4_5cur" })
    @SlashChoice({ name: "NAI Diffusion V4 Full", value: "V4" })
    @SlashChoice({ name: "NAI Diffusion V4 curated", value: "V4cur" })
    @SlashChoice({ name: "NAI Diffusion V3", value: "V3" })
    @SlashChoice({ name: "NAI Diffusion V3 Furry", value: "V3furry" })
    @SlashOption({
      description: "模型选择",
      name: "model",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    modelChoice: ModelChoiceKey | undefined,

    @SlashChoice({ name: "竖图 (832x1216)", value: "竖图" })
    @SlashChoice({ name: "横图 (1216x832)", value: "横图" })
    @SlashChoice({ name: "方图 (1024x1024)", value: "方图" })
    @SlashChoice({ name: "特殊竖图 (704x1472)", value: "特殊竖图" })
    @SlashChoice({ name: "特殊横图 (1472x704)", value: "特殊横图" })
    @SlashOption({
      description: "尺寸选择",
      name: "size",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sizeChoice: SizeChoiceKey | undefined,

    interaction: CommandInteraction,
  ): Promise<void> {
    // 延迟回复，因为生成需要时间
    await interaction.deferReply();

    try {
      // 获取图像服务
      const imageService = getImageService();

      // 解析模型
      const model = modelChoice
        ? ModelChoices[modelChoice]
        : ModelChoices["V4.5"];

      // 解析尺寸
      const size = sizeChoice
        ? ImageService.getSizeFromChoice(sizeChoice)
        : ImageService.getSizeFromChoice("竖图");

      // 生成图像
      const result = await imageService.generate({
        prompt,
        negative,
        model,
        width: size.width,
        height: size.height,
      });

      if (!result.success || !result.imageBuffer) {
        await interaction.editReply({
          content: `❌ 生成失败: ${result.error || "未知错误"}`,
        });
        return;
      }

      // 创建附件
      const filename = `nai_${Date.now()}.png`;
      const attachment = new AttachmentBuilder(result.imageBuffer, {
        name: filename,
      });

      // 创建 Embed
      const embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle("🎨 NovelAI 图像生成")
        .addFields(
          {
            name: "📝 Prompt",
            value:
              prompt.length > 1024 ? prompt.substring(0, 1021) + "..." : prompt,
          },
          {
            name: "⚙️ 参数",
            value: `**模型**: ${modelChoice || "V4.5"} | **尺寸**: ${result.metadata?.width}x${result.metadata?.height} | **Seed**: ${result.seed}`,
          },
        )
        .setImage(`attachment://${filename}`)
        .setFooter({
          text: `生成者: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // 如果有负向提示词，添加到 embed
      if (negative) {
        embed.addFields({
          name: "🚫 Negative",
          value:
            negative.length > 1024
              ? negative.substring(0, 1021) + "..."
              : negative,
        });
      }

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      const err = error as Error;
      console.error("NAI generation error:", err);

      let errorMessage = "生成过程中发生错误";
      if (err.message.includes("NAI_TOKEN")) {
        errorMessage = "NovelAI Token 未配置，请联系管理员";
      }

      await interaction.editReply({
        content: `❌ ${errorMessage}`,
      });
    }
  }
}
