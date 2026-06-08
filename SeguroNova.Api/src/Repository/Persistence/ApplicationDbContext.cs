using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Repository.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<UserRole> UserRoles => Set<UserRole>();

    public DbSet<UserKnowledgeBase> UserKnowledgeBases => Set<UserKnowledgeBase>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<PasswordRecoveryToken> PasswordRecoveryTokens => Set<PasswordRecoveryToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureUser(modelBuilder.Entity<User>());
        ConfigureRole(modelBuilder.Entity<Role>());
        ConfigureUserRole(modelBuilder.Entity<UserRole>());
        ConfigureKnowledgeBase(modelBuilder.Entity<UserKnowledgeBase>());
        ConfigureRefreshToken(modelBuilder.Entity<RefreshToken>());
        ConfigurePasswordRecoveryToken(modelBuilder.Entity<PasswordRecoveryToken>());
    }

    private static void ConfigureUser(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Email).HasMaxLength(320).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique();
        builder.Property(x => x.PasswordHash).IsRequired();
    }

    private static void ConfigureRole(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
    }

    private static void ConfigureUserRole(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<UserRole> builder)
    {
        builder.HasKey(x => new { x.UserId, x.RoleId });
        builder.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
        builder.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
    }

    private static void ConfigureKnowledgeBase(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<UserKnowledgeBase> builder)
    {
        builder.HasKey(x => new { x.UserId, x.KnowledgeBase });
        builder.Property(x => x.KnowledgeBase).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.HasOne(x => x.User).WithMany(x => x.KnowledgeBases).HasForeignKey(x => x.UserId);
    }

    private static void ConfigureRefreshToken(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(x => x.ExpiresAtUtc).IsRequired();
        builder.HasOne(x => x.User).WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId);
    }

    private static void ConfigurePasswordRecoveryToken(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<PasswordRecoveryToken> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.ExpiresAtUtc).IsRequired();
        builder.HasOne(x => x.User).WithMany(x => x.PasswordRecoveryTokens).HasForeignKey(x => x.UserId);
    }
}
